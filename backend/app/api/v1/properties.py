from typing import List, Optional

import logging

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.user import User
from app.schemas.common import MessageResponse
from app.schemas.property import (
    AssignFlatmateRequest,
    AssignTenantRequest,
    PropertyCreate,
    PropertyResponse,
    PropertyUpdate,
)
from app.services.property_service import PropertyService
from app.services.supabase_storage_service import storage_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("", response_model=List[PropertyResponse])
async def list_properties(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_permissions(Permission.PROPERTY_READ)),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    return await service.get_all(current_user, skip, limit)


@router.get("/search", response_model=List[PropertyResponse])
async def search_properties(
    city: str | None = Query(None),
    location: str | None = Query(None),
    lat: float | None = Query(None, ge=-90, le=90),
    lng: float | None = Query(None, ge=-180, le=180),
    radius_km: float | None = Query(None, ge=0.1, le=500),
    min_rent: float | None = Query(None),
    max_rent: float | None = Query(None),
    min_rooms: int | None = Query(None, ge=0),
    min_bedrooms: int | None = Query(None, ge=0),
    property_type: str | None = Query(None),
    query: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    return await service.search(
        city=city,
        location=location,
        lat=lat,
        lng=lng,
        radius_km=radius_km,
        min_rent=min_rent,
        max_rent=max_rent,
        min_rooms=min_rooms,
        min_bedrooms=min_bedrooms,
        property_type=property_type,
        query=query,
    )


@router.get("/my-flat", response_model=Optional[PropertyResponse])
async def get_my_flat(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    return await service.get_my_flat(current_user)


@router.post("", response_model=PropertyResponse, status_code=201)
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(require_permissions(Permission.PROPERTY_CREATE)),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    return await service.create(data, current_user)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: int,
    current_user: User = Depends(require_permissions(Permission.PROPERTY_READ)),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    return await service.get_by_id(property_id)


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    data: PropertyUpdate,
    current_user: User = Depends(require_permissions(Permission.PROPERTY_UPDATE)),
    db: AsyncSession = Depends(get_db),
):
    logger.info(
        "PUT /properties/%s user=%s payload=%s",
        property_id,
        current_user.id,
        data.model_dump(exclude_unset=True),
    )
    service = PropertyService(db)
    response = await service.update(property_id, data, current_user)
    logger.info(
        "PUT /properties/%s saved weekly_rent=%s name=%s",
        property_id,
        response.weekly_rent,
        response.name,
    )
    return response


@router.delete("/{property_id}", response_model=MessageResponse)
async def delete_property(
    property_id: int,
    current_user: User = Depends(require_permissions(Permission.PROPERTY_DELETE)),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    await service.delete(property_id, current_user)
    return MessageResponse(message="Property deleted")


@router.post("/{property_id}/tenants", response_model=dict)
async def assign_tenant(
    property_id: int,
    data: AssignTenantRequest,
    current_user: User = Depends(require_permissions(Permission.TENANT_ASSIGN)),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    return await service.assign_tenant(property_id, data)


@router.post("/{property_id}/flatmates", response_model=MessageResponse)
async def assign_flatmate(
    property_id: int,
    data: AssignFlatmateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return MessageResponse(message="Flatmate invitation sent")


@router.post("/{property_id}/photo", response_model=PropertyResponse)
async def upload_property_photo(
    property_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_permissions(Permission.PROPERTY_UPDATE)),
    db: AsyncSession = Depends(get_db),
):
    service = PropertyService(db)
    content = await file.read()
    ext = (file.filename or "photo.jpg").split(".")[-1]
    url = await storage_service.upload_property_photo(content, property_id, ext)
    return await service.update_photo(property_id, url, current_user)
