from typing import Optional

from pydantic import BaseModel, Field


class UserLocationUpdate(BaseModel):
    preferred_location_name: str = Field(min_length=1, max_length=255)
    preferred_latitude: Optional[float] = Field(None, ge=-90, le=90)
    preferred_longitude: Optional[float] = Field(None, ge=-180, le=180)


class UserLocationResponse(BaseModel):
    preferred_location_name: Optional[str] = None
    preferred_latitude: Optional[float] = None
    preferred_longitude: Optional[float] = None
