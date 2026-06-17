"""WebSocket endpoint for real-time chat.

Protocol (client → server):
  { "type": "message.send", "content": "...", "message_type": "text"|"image"|"document",
    "file_url": "...", "attachment_name": "...", "attachment_size": 123 }
  { "type": "message.read", "message_id": 42 }
  { "type": "typing.start" }
  { "type": "typing.stop" }

Protocol (server → client):
  { "type": "message.new", "message": { ...MessagePayload } }
  { "type": "message.read", "message_id": 42, "user_id": 7, "read_at": "..." }
  { "type": "typing.start", "user_id": 7 }
  { "type": "typing.stop", "user_id": 7 }
  { "type": "presence.online", "user_id": 7, "online_users": [...] }
  { "type": "presence.offline", "user_id": 7, "online_users": [...] }
  { "type": "error", "message": "..." }
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.core.security import decode_token
from app.models.chat import ChatRoom, Message, ReadReceipt
from app.models.user import User
from app.websocket.manager import manager

router = APIRouter()


def _message_payload(message: Message, sender: User | None = None) -> dict:
    return {
        "id": message.id,
        "room_id": message.room_id,
        "sender_id": message.sender_id,
        "sender_name": sender.full_name if sender else None,
        "sender_avatar_url": sender.avatar_url if sender else None,
        "content": message.content,
        "message_type": message.message_type,
        "file_url": message.file_url,
        "attachment_name": message.attachment_name,
        "attachment_size": message.attachment_size,
        "is_read": False,
        "read_by": [],
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }


@router.websocket("/ws/chat/{room_id}")
async def websocket_chat(
    websocket: WebSocket,
    room_id: int,
    token: str = Query(...),
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001, reason="Unauthorized")
        return

    user_id = int(payload["sub"])

    async with AsyncSessionLocal() as db:
        room_result = await db.execute(select(ChatRoom).where(ChatRoom.id == room_id))
        room = room_result.scalar_one_or_none()
        if not room:
            await websocket.close(code=4004, reason="Room not found")
            return

        user_result = await db.execute(select(User).where(User.id == user_id))
        current_user = user_result.scalar_one_or_none()
        if not current_user or not current_user.is_active:
            await websocket.close(code=4001, reason="Unauthorized")
            return

        # Update last_seen_at on connect
        current_user.last_seen_at = datetime.now(timezone.utc)
        await db.commit()

    await manager.connect(websocket, room_id, user_id)

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type", "message.send")

            # ----------------------------------------------------------------
            # Send a new message
            # ----------------------------------------------------------------
            if event_type == "message.send":
                content = data.get("content", "")
                message_type = data.get("message_type", "text")
                file_url = data.get("file_url")
                attachment_name = data.get("attachment_name")
                attachment_size = data.get("attachment_size")

                async with AsyncSessionLocal() as db:
                    message = Message(
                        room_id=room_id,
                        sender_id=user_id,
                        content=content,
                        message_type=message_type,
                        file_url=file_url,
                        attachment_name=attachment_name,
                        attachment_size=attachment_size,
                    )
                    db.add(message)
                    await db.commit()
                    await db.refresh(message)

                    # Reload sender
                    sender_result = await db.execute(
                        select(User).where(User.id == user_id)
                    )
                    sender = sender_result.scalar_one_or_none()

                await manager.broadcast(room_id, {
                    "type": "message.new",
                    "message": _message_payload(message, sender),
                })

            # ----------------------------------------------------------------
            # Mark a message as read
            # ----------------------------------------------------------------
            elif event_type == "message.read":
                message_id = data.get("message_id")
                if not message_id:
                    continue

                now = datetime.now(timezone.utc)

                async with AsyncSessionLocal() as db:
                    msg_result = await db.execute(
                        select(Message).where(
                            Message.id == message_id, Message.room_id == room_id
                        )
                    )
                    msg = msg_result.scalar_one_or_none()
                    if not msg:
                        continue

                    # Mark the message-level flag if we're not the sender
                    if msg.sender_id != user_id and not msg.is_read:
                        msg.is_read = True
                        msg.read_at = now

                    # Upsert a per-user read receipt
                    receipt = ReadReceipt(
                        message_id=message_id,
                        user_id=user_id,
                        read_at=now,
                    )
                    db.add(receipt)
                    try:
                        await db.commit()
                    except IntegrityError:
                        await db.rollback()  # already exists — that's fine

                await manager.broadcast(room_id, {
                    "type": "message.read",
                    "message_id": message_id,
                    "user_id": user_id,
                    "read_at": now.isoformat(),
                })

            # ----------------------------------------------------------------
            # Typing indicators
            # ----------------------------------------------------------------
            elif event_type == "typing.start":
                await manager.broadcast_typing(room_id, user_id, True)

            elif event_type == "typing.stop":
                await manager.broadcast_typing(room_id, user_id, False)

    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)

        # Persist last_seen_at on disconnect
        async with AsyncSessionLocal() as db:
            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            if user:
                user.last_seen_at = datetime.now(timezone.utc)
                await db.commit()

        await manager.broadcast_presence(room_id, user_id, "offline")
