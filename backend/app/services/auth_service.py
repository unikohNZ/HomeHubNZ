from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    create_verification_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.role import Role
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, data: RegisterRequest) -> UserResponse:
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        result = await self.db.execute(select(Role).where(Role.name == data.role))
        role = result.scalar_one_or_none()
        if not role:
            result = await self.db.execute(select(Role).where(Role.name == "tenant"))
            role = result.scalar_one()

        user = User(
            email=data.email,
            hashed_password=get_password_hash(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            role_id=role.id,
            is_active=True,
        )
        await self.user_repo.create(user)
        return self._to_response(user, role.name)

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account not active")

        access_token = create_access_token(str(user.id), {"role": user.role.name})
        refresh_token = create_refresh_token(str(user.id))
        user.refresh_token = refresh_token
        await self.user_repo.update(user)

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user = await self.user_repo.get_with_role(int(payload["sub"]))
        if not user or user.refresh_token != refresh_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        access_token = create_access_token(str(user.id), {"role": user.role.name})
        new_refresh = create_refresh_token(str(user.id))
        user.refresh_token = new_refresh
        await self.user_repo.update(user)

        return TokenResponse(access_token=access_token, refresh_token=new_refresh)

    async def logout(self, user: User) -> None:
        user.refresh_token = None
        await self.user_repo.update(user)

    async def forgot_password(self, email: str) -> str:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return "If the email exists, a reset link has been sent"
        return create_reset_token(email)

    async def reset_password(self, token: str, new_password: str) -> None:
        payload = decode_token(token)
        if not payload or payload.get("type") != "password_reset":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

        user = await self.user_repo.get_by_email(payload["sub"])
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user.hashed_password = get_password_hash(new_password)
        await self.user_repo.update(user)

    async def verify_email(self, token: str) -> None:
        payload = decode_token(token)
        if not payload or payload.get("type") != "email_verification":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

        user = await self.user_repo.get_by_email(payload["sub"])
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        user.is_verified = True
        user.is_active = True
        await self.user_repo.update(user)

    def _to_response(self, user: User, role_name: str) -> UserResponse:
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            is_verified=user.is_verified,
            role=role_name,
        )
