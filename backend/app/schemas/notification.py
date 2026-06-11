from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.enums import NotificationType


class NotificationResponse(BaseModel):
    id: int
    notification_type: NotificationType
    title: str
    body: str
    data: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DeviceTokenRequest(BaseModel):
    push_token: str
    platform: str  # ios, android
