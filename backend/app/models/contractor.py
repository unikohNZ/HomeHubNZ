from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class Contractor(Base, TimestampMixin):
    __tablename__ = "contractors"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(255))
    specialties: Mapped[Optional[str]] = mapped_column(Text)  # JSON array
    license_number: Mapped[Optional[str]] = mapped_column(String(100))
    is_available: Mapped[bool] = mapped_column(default=True)
    rating: Mapped[Optional[float]] = mapped_column(default=0.0)

    user: Mapped["User"] = relationship("User", back_populates="contractor_profile")
