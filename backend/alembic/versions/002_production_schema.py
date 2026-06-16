"""Production schema: property extensions, images, join requests, rules, events, emergency, chat, notifications, documents.

Revision ID: 002
Revises: 001
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Extend properties
    op.add_column("properties", sa.Column("name", sa.String(length=255), server_default="Untitled Property", nullable=False))
    op.add_column("properties", sa.Column("max_flatmates", sa.Integer(), server_default="4", nullable=False))
    op.add_column("properties", sa.Column("available_rooms", sa.Integer(), server_default="1", nullable=False))
    op.add_column("properties", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.add_column("properties", sa.Column("is_published", sa.Boolean(), server_default="true", nullable=False))
    op.create_index("ix_properties_city", "properties", ["city"])
    op.create_index("ix_properties_property_type", "properties", ["property_type"])

    # Extend users
    op.add_column("users", sa.Column("emergency_contact_name", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("emergency_contact_phone", sa.String(length=30), nullable=True))

    # Rent status: add upcoming + due_today
    op.execute("ALTER TYPE rentstatus ADD VALUE IF NOT EXISTS 'upcoming'")
    op.execute("ALTER TYPE rentstatus ADD VALUE IF NOT EXISTS 'due_today'")

    op.create_table(
        "property_images",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_property_images_property_id", "property_images", ["property_id"])

    op.create_table(
        "flatmates",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("invitation_token", sa.String(length=255), nullable=True),
        sa.Column("invitation_accepted", sa.Boolean(), nullable=False),
        sa.Column("rent_share_percent", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_flatmates_user_id", "flatmates", ["user_id"])
    op.create_index("ix_flatmates_property_id", "flatmates", ["property_id"])

    op.create_table(
        "join_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("status", sa.Enum("pending", "approved", "rejected", name="joinrequeststatus"), nullable=False),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_join_requests_property_id", "join_requests", ["property_id"])
    op.create_index("ix_join_requests_user_id", "join_requests", ["user_id"])
    op.create_index("ix_join_requests_status", "join_requests", ["status"])

    op.create_table(
        "house_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("rule_type", sa.Enum("smoking", "visitors", "quiet_hours", "cleaning", "pets", "other", name="houseruletype"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_house_rules_property_id", "house_rules", ["property_id"])

    op.create_table(
        "house_rule_acceptances",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("rule_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["rule_id"], ["house_rules.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "emergency_contacts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("relationship", sa.String(length=100), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "emergency_alerts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=True),
        sa.Column("alert_type", sa.Enum("earthquake", "tsunami", "flood", "storm", "fire", "general", name="emergencyalerttype"), nullable=False),
        sa.Column("severity", sa.Enum("normal", "watch", "warning", "emergency", name="emergencyseverity"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=False),
        sa.Column("evacuation_notes", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("file_url", sa.Text(), nullable=False),
        sa.Column("file_type", sa.String(length=50), nullable=False),
        sa.Column("document_type", sa.Enum("lease", "bond", "inspection", "property", "other", name="documenttype"), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "chat_rooms",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("room_type", sa.Enum("flatmate_group", "landlord", "private", "maintenance", name="chatroomtype"), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=True),
        sa.Column("maintenance_id", sa.Integer(), nullable=True),
        sa.Column("participant_ids", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["maintenance_id"], ["maintenance_requests.id"]),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("room_id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("message_type", sa.String(length=20), nullable=False),
        sa.Column("file_url", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["room_id"], ["chat_rooms.id"]),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_messages_room_created", "messages", ["room_id", "created_at"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("notification_type", sa.Enum("message", "rent", "maintenance", "property", "emergency", "join_request", "house_rules", "general", name="notificationtype"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("data", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("is_pushed", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notifications_user_read", "notifications", ["user_id", "is_read"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("messages")
    op.drop_table("chat_rooms")
    op.drop_table("documents")
    op.drop_table("emergency_alerts")
    op.drop_table("emergency_contacts")
    op.drop_table("events")
    op.drop_table("house_rule_acceptances")
    op.drop_table("house_rules")
    op.drop_table("join_requests")
    op.drop_table("flatmates")
    op.drop_table("property_images")
    op.drop_column("users", "emergency_contact_phone")
    op.drop_column("users", "emergency_contact_name")
    op.drop_column("properties", "is_published")
    op.drop_column("properties", "image_url")
    op.drop_column("properties", "available_rooms")
    op.drop_column("properties", "max_flatmates")
    op.drop_column("properties", "name")
