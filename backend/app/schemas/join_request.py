from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import JoinRequestStatus


class JoinRequestCreate(BaseModel):
    property_id: int
    message: Optional[str] = None


class JoinRequestReview(BaseModel):
    status: JoinRequestStatus


class JoinRequestResponse(BaseModel):
    id: int
    property_id: int
    user_id: int
    message: Optional[str]
    status: JoinRequestStatus
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class JoinRequestResponse(BaseModel):
    id: int
    property_id: int
    user_id: int
    message: Optional[str]
    status: JoinRequestStatus
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
