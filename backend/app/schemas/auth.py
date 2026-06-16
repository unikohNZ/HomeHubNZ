from typing import Optional

from pydantic import BaseModel, EmailStr, Field, computed_field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: Optional[str] = None
    role: str = "tenant"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class VerifyEmailRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    role: str

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def profile_photo_url(self) -> Optional[str]:
        return self.avatar_url
