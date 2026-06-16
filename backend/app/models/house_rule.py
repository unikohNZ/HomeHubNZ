from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import HouseRuleType

if TYPE_CHECKING:
    from app.models.property import Property
    from app.models.user import User


class HouseRule(Base, TimestampMixin):
    __tablename__ = "house_rules"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    rule_type: Mapped[HouseRuleType] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="house_rules")
    acceptances: Mapped[List["HouseRuleAcceptance"]] = relationship(
        "HouseRuleAcceptance",
        back_populates="rule",
        cascade="all, delete-orphan",
    )


class HouseRuleAcceptance(Base, TimestampMixin):
    __tablename__ = "house_rule_acceptances"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rule_id: Mapped[int] = mapped_column(ForeignKey("house_rules.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    accepted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    rule: Mapped["HouseRule"] = relationship("HouseRule", back_populates="acceptances")
    user: Mapped["User"] = relationship("User", back_populates="rule_acceptances")
