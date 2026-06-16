from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class AvatarUpdate(BaseModel):
    avatar_url: str
