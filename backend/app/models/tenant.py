from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    move_in_date: Mapped[Optional[date]] = mapped_column(Date)
    move_out_date: Mapped[Optional[date]] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(default=True)
    invitation_token: Mapped[Optional[str]] = mapped_column(String(255))
    invitation_accepted: Mapped[bool] = mapped_column(default=False)

    user: Mapped["User"] = relationship("User", back_populates="tenant_records")
    property: Mapped["Property"] = relationship("Property", back_populates="tenants")
