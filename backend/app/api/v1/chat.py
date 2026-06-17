import json
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.chat import ChatRoom, Message, ReadReceipt
from app.models.user import User
from app.schemas.chat import ChatRoomCreate, ChatRoomResponse, MessageCreate, MessageResponse, ReadReceiptResponse
from app.services.supabase_storage_service import storage_service

router = APIRouter()


def _user_in_room(room: ChatRoom, user_id: int) -> bool:
    try:
        participants = json.loads(room.participant_ids or "[]")
        return user_id in participants
    except (json.JSONDecodeError, TypeError):
        return False


def _message_response(message: Message, sender_name: str | None = None, sender_avatar_url: str | None = None) -> MessageResponse:
    read_by = [
        ReadReceiptResponse(user_id=r.user_id, read_at=r.read_at)
        for r in (message.read_receipts or [])
    ]
    return MessageResponse(
        id=message.id,
        room_id=message.room_id,
        sender_id=message.sender_id,
        sender_name=sender_name,
        sender_avatar_url=sender_avatar_url,
        content=message.content,
        message_type=message.message_type,
        file_url=message.file_url,
        attachment_name=message.attachment_name,
        attachment_size=message.attachment_size,
        is_read=message.is_read,
        created_at=message.created_at,
        read_by=read_by,
    )


async def _touch_last_seen(db: AsyncSession, user_id: int) -> None:
    await db.execute(
        update(User).where(User.id == user_id).values(last_seen_at=datetime.now(timezone.utc))
    )


@router.get("/rooms", response_model=List[ChatRoomResponse])
async def list_rooms(
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ChatRoom).order_by(ChatRoom.updated_at.desc()))
    rooms = [r for r in result.scalars().all() if _user_in_room(r, current_user.id)]
    responses = []
    for room in rooms:
        msg_result = await db.execute(
            select(Message)
            .options(selectinload(Message.sender), selectinload(Message.read_receipts))
            .where(Message.room_id == room.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()
        unread_result = await db.execute(
            select(func.count()).select_from(Message).where(
                Message.room_id == room.id,
                Message.sender_id != current_user.id,
                Message.is_read == False,  # noqa: E712
            )
        )
        last_response = None
        if last_msg:
            if last_msg.sender_id == current_user.id:
                sender_name = "You"
                avatar = current_user.avatar_url
            else:
                sender = last_msg.sender
                sender_name = sender.full_name if sender else None
                avatar = sender.avatar_url if sender else None
            last_response = _message_response(last_msg, sender_name, avatar)
        responses.append(ChatRoomResponse(
            id=room.id,
            name=room.name,
            room_type=room.room_type,
            property_id=room.property_id,
            last_message=last_response,
            unread_count=unread_result.scalar_one(),
        ))
    return responses


@router.post("/rooms", response_model=ChatRoomResponse, status_code=201)
async def create_room(
    data: ChatRoomCreate,
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    room = ChatRoom(
        name=data.name,
        room_type=data.room_type,
        property_id=data.property_id,
        maintenance_id=data.maintenance_id,
        participant_ids=json.dumps(data.participant_ids),
    )
    db.add(room)
    await db.flush()
    await db.refresh(room)
    return ChatRoomResponse(id=room.id, name=room.name, room_type=room.room_type, property_id=room.property_id)


@router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    room_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    room_result = await db.execute(select(ChatRoom).where(ChatRoom.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room or not _user_in_room(room, current_user.id):
        return []

    result = await db.execute(
        select(Message)
        .options(selectinload(Message.sender), selectinload(Message.read_receipts))
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    messages = result.scalars().all()

    now = datetime.now(timezone.utc)

    # Bulk-mark messages from others as read
    await db.execute(
        update(Message)
        .where(
            Message.room_id == room_id,
            Message.sender_id != current_user.id,
            Message.is_read == False,  # noqa: E712
        )
        .values(is_read=True, read_at=now)
    )

    # Insert read receipts for unread messages (ignore duplicates)
    for msg in messages:
        if msg.sender_id != current_user.id:
            already_read = any(r.user_id == current_user.id for r in msg.read_receipts)
            if not already_read:
                db.add(ReadReceipt(message_id=msg.id, user_id=current_user.id, read_at=now))

    await _touch_last_seen(db, current_user.id)

    responses = []
    for m in messages:
        if m.sender_id == current_user.id:
            sender_name = "You"
            avatar = current_user.avatar_url
        elif m.sender:
            sender_name = m.sender.full_name
            avatar = m.sender.avatar_url
        else:
            sender_name = None
            avatar = None
        responses.append(_message_response(m, sender_name, avatar))
    return responses


@router.post("/rooms/{room_id}/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    room_id: int,
    data: MessageCreate,
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    message = Message(
        room_id=room_id,
        sender_id=current_user.id,
        content=data.content,
        message_type=data.message_type,
        file_url=data.file_url,
        attachment_name=data.attachment_name,
        attachment_size=data.attachment_size,
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    await _touch_last_seen(db, current_user.id)
    return _message_response(message, "You", current_user.avatar_url)


@router.post("/rooms/{room_id}/messages/image", response_model=MessageResponse, status_code=201)
async def send_image_message(
    room_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    filename = file.filename or "image.jpg"
    ext = filename.rsplit(".", 1)[-1]
    url = await storage_service.upload_chat_attachment(
        content,
        room_id,
        filename,
        file.content_type or f"image/{ext}",
    )
    message = Message(
        room_id=room_id,
        sender_id=current_user.id,
        content="",
        message_type="image",
        file_url=url,
        attachment_name=filename,
        attachment_size=len(content),
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    await _touch_last_seen(db, current_user.id)
    return _message_response(message, "You", current_user.avatar_url)


@router.post("/rooms/{room_id}/messages/document", response_model=MessageResponse, status_code=201)
async def send_document_message(
    room_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF/document and attach it as a chat message."""
    content = await file.read()
    filename = file.filename or "document"
    url = await storage_service.upload_chat_attachment(
        content,
        room_id,
        filename,
        file.content_type or "application/octet-stream",
    )
    message = Message(
        room_id=room_id,
        sender_id=current_user.id,
        content="",
        message_type="document",
        file_url=url,
        attachment_name=filename,
        attachment_size=len(content),
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    await _touch_last_seen(db, current_user.id)
    return _message_response(message, "You", current_user.avatar_url)
