from datetime import date, datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import InspectionStatus

if TYPE_CHECKING:
    from app.models.property import Property


class Inspection(Base, TimestampMixin):
    __tablename__ = "inspections"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[InspectionStatus] = mapped_column(default=InspectionStatus.SCHEDULED)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    conducted_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

    property: Mapped["Property"] = relationship("Property", back_populates="inspections")
    reports: Mapped[List["InspectionReport"]] = relationship("InspectionReport", back_populates="inspection")


class InspectionReport(Base, TimestampMixin):
    __tablename__ = "inspection_reports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    inspection_id: Mapped[int] = mapped_column(ForeignKey("inspections.id"), nullable=False, index=True)
    findings: Mapped[Optional[str]] = mapped_column(Text)
    photo_urls: Mapped[Optional[str]] = mapped_column(Text)
    pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    inspection: Mapped["Inspection"] = relationship("Inspection", back_populates="reports")
