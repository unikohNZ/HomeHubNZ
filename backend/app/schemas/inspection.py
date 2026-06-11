from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import InspectionStatus


class InspectionCreate(BaseModel):
    property_id: int
    scheduled_date: date
    notes: Optional[str] = None


class InspectionReportCreate(BaseModel):
    findings: str = Field(min_length=1)
    photo_urls: Optional[List[str]] = None


class InspectionResponse(BaseModel):
    id: int
    property_id: int
    scheduled_date: date
    status: InspectionStatus
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class InspectionReportResponse(BaseModel):
    id: int
    inspection_id: int
    findings: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    pdf_url: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
