from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import UserResponse
from app.schemas.location import UserLocationResponse, UserLocationUpdate
from app.schemas.profile import AvatarUpdate, ProfileUpdate
from app.utils.geo import coords_for_place


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_profile(self, user: User) -> UserResponse:
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            is_verified=user.is_verified,
            role=user.role.name,
        )

    async def update_profile(self, user: User, data: ProfileUpdate) -> UserResponse:
        if data.email and data.email != user.email:
            existing = await self.user_repo.get_by_email(data.email)
            if existing and existing.id != user.id:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
            user.email = data.email
        if data.first_name is not None:
            user.first_name = data.first_name
        if data.last_name is not None:
            user.last_name = data.last_name
        if data.phone is not None:
            user.phone = data.phone
        if data.emergency_contact_name is not None:
            user.emergency_contact_name = data.emergency_contact_name
        if data.emergency_contact_phone is not None:
            user.emergency_contact_phone = data.emergency_contact_phone

        await self.user_repo.update(user)
        return await self.get_profile(user)

    async def update_avatar(self, user: User, data: AvatarUpdate) -> UserResponse:
        user.avatar_url = data.avatar_url
        await self.user_repo.update(user)
        return await self.get_profile(user)

    async def get_location(self, user: User) -> UserLocationResponse:
        return UserLocationResponse(
            preferred_location_name=user.preferred_location_name,
            preferred_latitude=user.preferred_latitude,
            preferred_longitude=user.preferred_longitude,
        )

    async def update_location(self, user: User, data: UserLocationUpdate) -> UserLocationResponse:
        user.preferred_location_name = data.preferred_location_name
        lat = data.preferred_latitude
        lng = data.preferred_longitude
        if lat is None or lng is None:
            guessed = coords_for_place(data.preferred_location_name)
            if guessed:
                lat, lng = guessed
        user.preferred_latitude = lat
        user.preferred_longitude = lng
        await self.user_repo.update(user)
        return await self.get_location(user)
