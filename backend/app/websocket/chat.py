import json
from datetime import datetime, timezone

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import decode_token
from app.models.chat import ChatRoom, Message
from app.websocket.manager import manager

router = APIRouter()


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
        result = await db.execute(select(ChatRoom).where(ChatRoom.id == room_id))
        room = result.scalar_one_or_none()
        if not room:
            await websocket.close(code=4004, reason="Room not found")
            return

    await manager.connect(websocket, room_id, user_id)

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type", "message.send")

            if event_type == "message.send":
                content = data.get("content", "")
                message_type = data.get("message_type", "text")
                file_url = data.get("file_url")

                async with AsyncSessionLocal() as db:
                    message = Message(
                        room_id=room_id,
                        sender_id=user_id,
                        content=content,
                        message_type=message_type,
                        file_url=file_url,
                    )
                    db.add(message)
                    await db.commit()
                    await db.refresh(message)

                    await manager.broadcast(room_id, {
                        "type": "message.new",
                        "message": {
                            "id": message.id,
                            "room_id": room_id,
                            "sender_id": user_id,
                            "content": content,
                            "message_type": message_type,
                            "file_url": file_url,
                            "is_read": False,
                            "created_at": message.created_at.isoformat(),
                        },
                    })

            elif event_type == "message.read":
                message_id = data.get("message_id")
                async with AsyncSessionLocal() as db:
                    result = await db.execute(
                        select(Message).where(Message.id == message_id, Message.room_id == room_id)
                    )
                    msg = result.scalar_one_or_none()
                    if msg:
                        msg.is_read = True
                        msg.read_at = datetime.now(timezone.utc)
                        await db.commit()

                await manager.broadcast(room_id, {
                    "type": "message.read",
                    "message_id": message_id,
                    "user_id": user_id,
                })

            elif event_type == "typing.start":
                await manager.broadcast_typing(room_id, user_id, True)

            elif event_type == "typing.stop":
                await manager.broadcast_typing(room_id, user_id, False)

    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        await manager.broadcast_presence(room_id, user_id, "offline")
