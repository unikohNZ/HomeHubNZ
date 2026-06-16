from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import JoinRequestStatus

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class JoinRequest(Base, TimestampMixin):
    __tablename__ = "join_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    message: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[JoinRequestStatus] = mapped_column(
        default=JoinRequestStatus.PENDING,
        nullable=False,
        index=True,
    )
    reviewed_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    property: Mapped["Property"] = relationship("Property", back_populates="join_requests")
    applicant: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="join_requests")
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by])
