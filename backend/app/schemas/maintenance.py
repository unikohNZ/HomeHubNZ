from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import MaintenancePriority, MaintenanceStatus


class MaintenanceCreate(BaseModel):
    property_id: int
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    priority: MaintenancePriority = MaintenancePriority.MEDIUM
    image_urls: Optional[List[str]] = None
    video_urls: Optional[List[str]] = None


class MaintenanceUpdate(BaseModel):
    status: Optional[MaintenanceStatus] = None
    priority: Optional[MaintenancePriority] = None
    assigned_to: Optional[int] = None
    completion_photos: Optional[List[str]] = None


class MaintenanceCommentCreate(BaseModel):
    content: str = Field(min_length=1)


class MaintenanceResponse(BaseModel):
    id: int
    property_id: int
    submitted_by: int
    assigned_to: Optional[int] = None
    title: str
    description: str
    category: Optional[str] = None
    priority: MaintenancePriority
    status: MaintenanceStatus
    image_urls: Optional[List[str]] = None
    ai_suggestion: Optional[str] = None

    model_config = {"from_attributes": True}
