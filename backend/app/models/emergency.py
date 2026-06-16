from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import EmergencyAlertType, EmergencySeverity

if TYPE_CHECKING:
    from app.models.property import Property


class EmergencyContact(Base, TimestampMixin):
    __tablename__ = "emergency_contacts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    relationship: Mapped[Optional[str]] = mapped_column(String(100))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped["Property"] = relationship("Property", back_populates="emergency_contacts")


class EmergencyAlert(Base, TimestampMixin):
    """NZ Civil Defence / household emergency alerts."""

    __tablename__ = "emergency_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[Optional[int]] = mapped_column(ForeignKey("properties.id"), index=True)
    alert_type: Mapped[EmergencyAlertType] = mapped_column(nullable=False)
    severity: Mapped[EmergencySeverity] = mapped_column(default=EmergencySeverity.NORMAL, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    instructions: Mapped[str] = mapped_column(Text, nullable=False)
    evacuation_notes: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    property: Mapped[Optional["Property"]] = relationship("Property", back_populates="emergency_alerts")
