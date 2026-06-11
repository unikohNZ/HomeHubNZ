from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class Flatmate(Base, TimestampMixin):
    __tablename__ = "flatmates"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    invitation_token: Mapped[Optional[str]] = mapped_column(String(255))
    invitation_accepted: Mapped[bool] = mapped_column(default=False)
    rent_share_percent: Mapped[Optional[float]] = mapped_column(default=50.0)

    user: Mapped["User"] = relationship("User", back_populates="flatmate_records")
    property: Mapped["Property"] = relationship("Property", back_populates="flatmates")
