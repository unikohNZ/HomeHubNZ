from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import RentStatus

if TYPE_CHECKING:
    from app.models.lease import Lease


class RentPayment(Base, TimestampMixin):
    __tablename__ = "rent_payments"
    __table_args__ = (
        Index("ix_rent_payments_lease_due", "lease_id", "due_date"),
        Index("ix_rent_payments_status", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    lease_id: Mapped[int] = mapped_column(ForeignKey("leases.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    payment_date: Mapped[Optional[date]] = mapped_column(Date)
    status: Mapped[RentStatus] = mapped_column(default=RentStatus.PENDING)
    receipt_url: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    approved_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

    lease: Mapped["Lease"] = relationship("Lease", back_populates="rent_payments")
