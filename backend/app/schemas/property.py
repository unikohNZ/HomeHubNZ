from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import PropertyType, RentFrequency


class PropertyCreate(BaseModel):
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: Optional[str] = None
    suburb: str
    city: str
    postcode: str
    property_type: PropertyType
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0)
    rent_amount: Decimal = Field(gt=0)
    bond_amount: Decimal = Field(ge=0)
    rent_frequency: RentFrequency = RentFrequency.WEEKLY
    description: Optional[str] = None


class PropertyUpdate(BaseModel):
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    suburb: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    property_type: Optional[PropertyType] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    rent_amount: Optional[Decimal] = None
    bond_amount: Optional[Decimal] = None
    rent_frequency: Optional[RentFrequency] = None
    description: Optional[str] = None


class PropertyResponse(BaseModel):
    id: int
    owner_id: int
    address_line1: str
    address_line2: Optional[str] = None
    suburb: str
    city: str
    postcode: str
    property_type: PropertyType
    bedrooms: int
    bathrooms: int
    rent_amount: Decimal
    bond_amount: Decimal
    rent_frequency: RentFrequency
    description: Optional[str] = None
    image_urls: Optional[List[str]] = None
    full_address: str

    model_config = {"from_attributes": True}


class AssignTenantRequest(BaseModel):
    email: str
    move_in_date: Optional[date] = None


class AssignFlatmateRequest(BaseModel):
    email: str
    rent_share_percent: float = Field(ge=0, le=100, default=50.0)
