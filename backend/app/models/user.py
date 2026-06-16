from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.chat import Message
    from app.models.flatmate import Flatmate
    from app.models.house_rule import HouseRuleAcceptance
    from app.models.join_request import JoinRequest
    from app.models.notification import Notification
    from app.models.property import Property
    from app.models.role import Role


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255))
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(30))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(Text)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False, index=True)

    role: Mapped["Role"] = relationship("Role", back_populates="users")
    owned_properties: Mapped[List["Property"]] = relationship(
        "Property",
        back_populates="owner",
        foreign_keys="Property.owner_id",
    )
    flatmate_records: Mapped[List["Flatmate"]] = relationship("Flatmate", back_populates="user")
    join_requests: Mapped[List["JoinRequest"]] = relationship(
        "JoinRequest",
        back_populates="applicant",
        foreign_keys="JoinRequest.user_id",
    )
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="sender")
    rule_acceptances: Mapped[List["HouseRuleAcceptance"]] = relationship(
        "HouseRuleAcceptance",
        back_populates="user",
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
