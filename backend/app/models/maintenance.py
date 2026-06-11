from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import MaintenancePriority, MaintenanceStatus

if TYPE_CHECKING:
    from app.models.property import Property


class MaintenanceRequest(Base, TimestampMixin):
    __tablename__ = "maintenance_requests"
    __table_args__ = (Index("ix_maintenance_property_status", "property_id", "status"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    submitted_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    assigned_to: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    priority: Mapped[MaintenancePriority] = mapped_column(
        default=MaintenancePriority.MEDIUM,
        nullable=False,
    )
    status: Mapped[MaintenanceStatus] = mapped_column(
        default=MaintenanceStatus.SUBMITTED,
        nullable=False,
    )
    image_urls: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped["Property"] = relationship("Property", back_populates="maintenance_requests")
