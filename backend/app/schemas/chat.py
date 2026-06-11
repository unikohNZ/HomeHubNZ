from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import ChatRoomType


class ChatRoomCreate(BaseModel):
    name: Optional[str] = None
    room_type: ChatRoomType
    property_id: Optional[int] = None
    maintenance_id: Optional[int] = None
    participant_ids: List[int]


class MessageCreate(BaseModel):
    content: str = Field(min_length=1)
    message_type: str = "text"
    file_url: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    room_id: int
    sender_id: int
    content: str
    message_type: str
    file_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRoomResponse(BaseModel):
    id: int
    name: Optional[str] = None
    room_type: ChatRoomType
    property_id: Optional[int] = None
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0

    model_config = {"from_attributes": True}
