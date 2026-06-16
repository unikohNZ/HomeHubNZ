from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import PropertyType, RentFrequency


class PropertyCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    suburb: str = "Tauranga"
    postcode: str = "3110"
    property_type: PropertyType = PropertyType.APARTMENT
    bedrooms: int = Field(ge=0, default=1)
    bathrooms: int = Field(ge=0, default=1)
    weekly_rent: Decimal = Field(gt=0)
    bond_amount: Decimal = Field(ge=0)
    description: Optional[str] = None
    available_rooms: int = Field(ge=0, default=1)
    max_flatmates: Optional[int] = Field(None, ge=1)
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    suburb: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    property_type: Optional[PropertyType] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    weekly_rent: Optional[Decimal] = Field(None, gt=0)
    bond_amount: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None
    available_rooms: Optional[int] = Field(None, ge=0)
    max_flatmates: Optional[int] = Field(None, ge=1)
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None
    is_published: Optional[bool] = None


class PropertyResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    address: str
    city: str
    suburb: str
    postcode: str
    description: Optional[str] = None
    weekly_rent: Decimal
    bond_amount: Decimal
    bedrooms: int
    bathrooms: int
    available_rooms: int
    max_flatmates: int
    flatmate_count: int
    occupancy: str
    property_type: PropertyType
    rent_frequency: RentFrequency
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None
    image_urls: Optional[List[str]] = None
    full_address: str
    # Legacy aliases for existing clients
    address_line1: str
    rent_amount: Decimal

    model_config = {"from_attributes": True}


class AssignTenantRequest(BaseModel):
    email: str
    move_in_date: Optional[date] = None


class AssignFlatmateRequest(BaseModel):
    email: str
    rent_share_percent: float = Field(ge=0, le=100, default=50.0)
