from datetime import date
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.rent import RentPayment


class Lease(Base, TimestampMixin):
    """Lease agreement — required parent table for rent payments."""

    __tablename__ = "leases"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    terms: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="leases")
    rent_payments: Mapped[List["RentPayment"]] = relationship("RentPayment", back_populates="lease")
