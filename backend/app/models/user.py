from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.activity_log import ActivityLog
    from app.models.contractor import Contractor
    from app.models.flatmate import Flatmate
    from app.models.chat import Message
    from app.models.notification import Notification
    from app.models.property import Property
    from app.models.role import Role
    from app.models.tenant import Tenant


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    refresh_token: Mapped[Optional[str]] = mapped_column(Text)
    push_token: Mapped[Optional[str]] = mapped_column(String(500))
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), nullable=False, index=True)

    role: Mapped["Role"] = relationship("Role", back_populates="users")
    owned_properties: Mapped[List["Property"]] = relationship(
        "Property", back_populates="owner", foreign_keys="Property.owner_id"
    )
    tenant_records: Mapped[List["Tenant"]] = relationship("Tenant", back_populates="user")
    flatmate_records: Mapped[List["Flatmate"]] = relationship("Flatmate", back_populates="user")
    contractor_profile: Mapped[Optional["Contractor"]] = relationship(
        "Contractor", back_populates="user", uselist=False
    )
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="sender")
    activity_logs: Mapped[List["ActivityLog"]] = relationship("ActivityLog", back_populates="user")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
