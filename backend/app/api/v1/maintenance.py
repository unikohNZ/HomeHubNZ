from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.user import User
from app.schemas.maintenance import (
    MaintenanceCommentCreate,
    MaintenanceCreate,
    MaintenanceResponse,
    MaintenanceUpdate,
)
from app.services.maintenance_service import MaintenanceService

router = APIRouter()


@router.get("", response_model=List[MaintenanceResponse])
async def list_maintenance(
    property_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MaintenanceService(db)
    return await service.get_by_property(property_id)


@router.post("", response_model=MaintenanceResponse, status_code=201)
async def create_maintenance(
    data: MaintenanceCreate,
    current_user: User = Depends(require_permissions(Permission.MAINTENANCE_SUBMIT)),
    db: AsyncSession = Depends(get_db),
):
    service = MaintenanceService(db)
    return await service.create(data, current_user)


@router.put("/{request_id}", response_model=MaintenanceResponse)
async def update_maintenance(
    request_id: int,
    data: MaintenanceUpdate,
    current_user: User = Depends(require_permissions(Permission.MAINTENANCE_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    service = MaintenanceService(db)
    return await service.update(request_id, data)


@router.post("/{request_id}/comments", response_model=dict)
async def add_comment(
    request_id: int,
    data: MaintenanceCommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MaintenanceService(db)
    return await service.add_comment(request_id, data, current_user)


@router.post("/{request_id}/assign", response_model=MaintenanceResponse)
async def assign_contractor(
    request_id: int,
    contractor_id: int = Query(...),
    current_user: User = Depends(require_permissions(Permission.MAINTENANCE_ASSIGN)),
    db: AsyncSession = Depends(get_db),
):
    service = MaintenanceService(db)
    return await service.assign_contractor(request_id, contractor_id)
