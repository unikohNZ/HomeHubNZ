import json
from typing import Dict, Set

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}
        self.typing_users: Dict[int, Set[int]] = {}
        self.online_users: Set[int] = set()

    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        self.online_users.add(user_id)
        await self.broadcast_presence(room_id, user_id, "online")

    def disconnect(self, room_id: int, user_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(user_id, None)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        self.online_users.discard(user_id)

    async def send_personal(self, websocket: WebSocket, message: dict):
        await websocket.send_json(message)

    async def broadcast(self, room_id: int, message: dict, exclude_user: int | None = None):
        if room_id not in self.active_connections:
            return
        for user_id, connection in self.active_connections[room_id].items():
            if exclude_user and user_id == exclude_user:
                continue
            try:
                await connection.send_json(message)
            except Exception:
                pass

    async def broadcast_presence(self, room_id: int, user_id: int, status: str):
        await self.broadcast(room_id, {
            "type": f"presence.{status}",
            "user_id": user_id,
            "online_users": list(self.online_users),
        })

    async def broadcast_typing(self, room_id: int, user_id: int, is_typing: bool):
        event = "typing.start" if is_typing else "typing.stop"
        await self.broadcast(room_id, {"type": event, "user_id": user_id}, exclude_user=user_id)

    def is_user_online(self, user_id: int) -> bool:
        return user_id in self.online_users


manager = ConnectionManager()
