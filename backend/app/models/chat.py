from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.enums import ChatRoomType

if TYPE_CHECKING:
    from app.models.user import User


class ChatRoom(Base, TimestampMixin):
    __tablename__ = "chat_rooms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[Optional[str]] = mapped_column(String(255))
    room_type: Mapped[ChatRoomType] = mapped_column(nullable=False)
    property_id: Mapped[Optional[int]] = mapped_column(ForeignKey("properties.id"), index=True)
    maintenance_id: Mapped[Optional[int]] = mapped_column(ForeignKey("maintenance_requests.id"))
    participant_ids: Mapped[Optional[str]] = mapped_column(Text)  # JSON array of user IDs

    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="room", cascade="all, delete-orphan"
    )


class Message(Base, TimestampMixin):
    __tablename__ = "messages"
    __table_args__ = (Index("ix_messages_room_created", "room_id", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("chat_rooms.id"), nullable=False)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # "text" | "image" | "document"
    message_type: Mapped[str] = mapped_column(String(20), default="text")
    file_url: Mapped[Optional[str]] = mapped_column(Text)
    attachment_name: Mapped[Optional[str]] = mapped_column(String(255))
    attachment_size: Mapped[Optional[int]] = mapped_column(Integer)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    room: Mapped["ChatRoom"] = relationship("ChatRoom", back_populates="messages")
    sender: Mapped["User"] = relationship("User", back_populates="messages")
    read_receipts: Mapped[List["ReadReceipt"]] = relationship(
        "ReadReceipt", back_populates="message", cascade="all, delete-orphan"
    )


class ReadReceipt(Base):
    __tablename__ = "message_read_receipts"
    __table_args__ = (
        UniqueConstraint("message_id", "user_id", name="uq_receipt_msg_user"),
        Index("ix_read_receipts_message", "message_id"),
        Index("ix_read_receipts_user", "user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    message_id: Mapped[int] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    read_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    message: Mapped["Message"] = relationship("Message", back_populates="read_receipts")
    user: Mapped["User"] = relationship("User")
