import json
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.chat import ChatRoom, Message
from app.models.user import User
from app.schemas.chat import ChatRoomCreate, ChatRoomResponse, MessageCreate, MessageResponse

router = APIRouter()


@router.get("/rooms", response_model=List[ChatRoomResponse])
async def list_rooms(
    current_user: User = Depends(require_permissions(Permission.CHAT_ACCESS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ChatRoom).order_by(ChatRoom.updated_at.desc()))
    rooms = result.scalars().all()
    responses = []
    for room in rooms:
        msg_result = await db.execute(
            select(Message).where(Message.room_id == room.id).order_by(Message.created_at.desc()).limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()
        unread_result = await db.execute(
            select(func.count()).select_from(Message).where(
                Message.room_id == room.id,
                Message.sender_id != current_user.id,
                Message.is_read == False,  # noqa: E712
            )
        )
        responses.append(ChatRoomResponse(
            id=room.id,
            name=room.name,
            room_type=room.room_type,
            property_id=room.property_id,
            last_message=MessageResponse.model_validate(last_msg) if last_msg else None,
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
    result = await db.execute(
        select(Message)
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return [MessageResponse.model_validate(m) for m in result.scalars().all()]


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
    )
    db.add(message)
    await db.flush()
    await db.refresh(message)
    return MessageResponse.model_validate(message)
