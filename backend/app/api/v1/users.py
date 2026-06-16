"""User profile routes — spec aliases for /profile."""

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.schemas.profile import AvatarUpdate, ProfileUpdate
from app.services.profile_service import ProfileService
from app.services.supabase_storage_service import storage_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    return await service.get_profile(current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    return await service.update_profile(current_user, data)


@router.post("/me/photo", response_model=UserResponse)
async def upload_me_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    ext = (file.filename or "avatar.jpg").split(".")[-1]
    url = await storage_service.upload_profile_photo(content, current_user.id, ext)
    service = ProfileService(db)
    return await service.update_avatar(current_user, AvatarUpdate(avatar_url=url))
