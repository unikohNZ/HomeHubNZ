from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.property import Property


class PropertyImage(Base, TimestampMixin):
    __tablename__ = "property_images"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="images")
