from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import PropertyType, RentFrequency

if TYPE_CHECKING:
    from app.models.bill import Bill
    from app.models.document import Document
    from app.models.flatmate import Flatmate
    from app.models.inspection import Inspection
    from app.models.lease import Lease
    from app.models.maintenance import MaintenanceRequest
    from app.models.task import Task
    from app.models.tenant import Tenant
    from app.models.user import User


class Property(Base, TimestampMixin):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255))
    suburb: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    postcode: Mapped[str] = mapped_column(String(10), nullable=False)
    property_type: Mapped[PropertyType] = mapped_column(nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    rent_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    bond_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    rent_frequency: Mapped[RentFrequency] = mapped_column(default=RentFrequency.WEEKLY)
    description: Mapped[Optional[str]] = mapped_column(Text)
    image_urls: Mapped[Optional[str]] = mapped_column(Text)  # JSON array stored as text

    owner: Mapped["User"] = relationship("User", back_populates="owned_properties", foreign_keys=[owner_id])
    tenants: Mapped[List["Tenant"]] = relationship("Tenant", back_populates="property")
    flatmates: Mapped[List["Flatmate"]] = relationship("Flatmate", back_populates="property")
    leases: Mapped[List["Lease"]] = relationship("Lease", back_populates="property")
    maintenance_requests: Mapped[List["MaintenanceRequest"]] = relationship(
        "MaintenanceRequest", back_populates="property"
    )
    inspections: Mapped[List["Inspection"]] = relationship("Inspection", back_populates="property")
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="property")
    bills: Mapped[List["Bill"]] = relationship("Bill", back_populates="property")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="property")

    @property
    def full_address(self) -> str:
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.extend([self.suburb, self.city, self.postcode])
        return ", ".join(parts)
