from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.inspection import Inspection, InspectionReport
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.inspection import (
    InspectionCreate,
    InspectionReportCreate,
    InspectionReportResponse,
    InspectionResponse,
)

router = APIRouter()


@router.get("", response_model=List[InspectionResponse])
async def list_inspections(
    property_id: int = Query(...),
    current_user: User = Depends(require_permissions(Permission.INSPECTION_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Inspection).where(Inspection.property_id == property_id))
    return [InspectionResponse.model_validate(i) for i in result.scalars().all()]


@router.post("", response_model=InspectionResponse, status_code=201)
async def create_inspection(
    data: InspectionCreate,
    current_user: User = Depends(require_permissions(Permission.INSPECTION_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    inspection = Inspection(**data.model_dump(), conducted_by=current_user.id)
    db.add(inspection)
    await db.flush()
    await db.refresh(inspection)
    return InspectionResponse.model_validate(inspection)


@router.post("/{inspection_id}/report", response_model=InspectionReportResponse, status_code=201)
async def create_report(
    inspection_id: int,
    data: InspectionReportCreate,
    current_user: User = Depends(require_permissions(Permission.INSPECTION_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    import json
    from datetime import datetime, timezone

    report = InspectionReport(
        inspection_id=inspection_id,
        findings=data.findings,
        photo_urls=json.dumps(data.photo_urls) if data.photo_urls else None,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)
    return InspectionReportResponse.model_validate(report)
