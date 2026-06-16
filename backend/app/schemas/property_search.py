from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import PropertyType


class PropertySearchParams(BaseModel):
    city: Optional[str] = None
    min_rent: Optional[Decimal] = None
    max_rent: Optional[Decimal] = None
    min_rooms: Optional[int] = Field(None, ge=0)
    property_type: Optional[PropertyType] = None
    query: Optional[str] = None
