from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import PropertyType, RentFrequency

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.emergency import EmergencyAlert, EmergencyContact
    from app.models.event import Event
    from app.models.flatmate import Flatmate
    from app.models.house_rule import HouseRule
    from app.models.join_request import JoinRequest
    from app.models.lease import Lease
    from app.models.maintenance import MaintenanceRequest
    from app.models.property_image import PropertyImage
    from app.models.tenant import Tenant
    from app.models.user import User


class Property(Base, TimestampMixin):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled Property")
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255))
    suburb: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    postcode: Mapped[str] = mapped_column(String(10), nullable=False)
    property_type: Mapped[PropertyType] = mapped_column(nullable=False, index=True)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    max_flatmates: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    available_rooms: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    rent_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    bond_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    rent_frequency: Mapped[RentFrequency] = mapped_column(default=RentFrequency.WEEKLY, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    lease_start: Mapped[Optional[date]] = mapped_column(Date)
    lease_end: Mapped[Optional[date]] = mapped_column(Date)

    owner: Mapped["User"] = relationship("User", back_populates="owned_properties", foreign_keys=[owner_id])
    leases: Mapped[List["Lease"]] = relationship("Lease", back_populates="property")
    maintenance_requests: Mapped[List["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest",
        back_populates="property",
    )
    flatmates: Mapped[List["Flatmate"]] = relationship("Flatmate", back_populates="property")
    tenants: Mapped[List["Tenant"]] = relationship("Tenant", back_populates="property")
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="property")
    images: Mapped[List["PropertyImage"]] = relationship(
        "PropertyImage",
        back_populates="property",
        cascade="all, delete-orphan",
    )
    join_requests: Mapped[List["JoinRequest"]] = relationship("JoinRequest", back_populates="property")
    house_rules: Mapped[List["HouseRule"]] = relationship("HouseRule", back_populates="property")
    events: Mapped[List["Event"]] = relationship("Event", back_populates="property")
    emergency_contacts: Mapped[List["EmergencyContact"]] = relationship(
        "EmergencyContact",
        back_populates="property",
    )
    emergency_alerts: Mapped[List["EmergencyAlert"]] = relationship(
        "EmergencyAlert",
        back_populates="property",
    )

    @property
    def full_address(self) -> str:
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.extend([self.suburb, self.city, self.postcode])
        return ", ".join(parts)
