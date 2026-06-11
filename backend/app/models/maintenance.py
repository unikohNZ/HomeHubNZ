from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import MaintenancePriority, MaintenanceStatus

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class MaintenanceRequest(Base, TimestampMixin):
    __tablename__ = "maintenance_requests"
    __table_args__ = (Index("ix_maintenance_property_status", "property_id", "status"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    submitted_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    assigned_to: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100))
    priority: Mapped[MaintenancePriority] = mapped_column(default=MaintenancePriority.MEDIUM)
    status: Mapped[MaintenanceStatus] = mapped_column(default=MaintenanceStatus.SUBMITTED)
    image_urls: Mapped[Optional[str]] = mapped_column(Text)
    video_urls: Mapped[Optional[str]] = mapped_column(Text)
    completion_photos: Mapped[Optional[str]] = mapped_column(Text)
    ai_suggestion: Mapped[Optional[str]] = mapped_column(Text)

    property: Mapped["Property"] = relationship("Property", back_populates="maintenance_requests")
    comments: Mapped[List["MaintenanceComment"]] = relationship(
        "MaintenanceComment", back_populates="maintenance_request"
    )


class MaintenanceComment(Base, TimestampMixin):
    __tablename__ = "maintenance_comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    maintenance_id: Mapped[int] = mapped_column(
        ForeignKey("maintenance_requests.id"), nullable=False, index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    maintenance_request: Mapped["MaintenanceRequest"] = relationship(
        "MaintenanceRequest", back_populates="comments"
    )
