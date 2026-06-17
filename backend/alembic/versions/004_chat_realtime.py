"""Add read receipts, attachment metadata, last_seen_at for realtime chat.

Revision ID: 004
Revises: 003
Create Date: 2026-06-17
"""

from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------
    # messages — add attachment columns
    # ------------------------------------------------------------------
    op.add_column("messages", sa.Column("attachment_name", sa.String(length=255), nullable=True))
    op.add_column("messages", sa.Column("attachment_size", sa.Integer(), nullable=True))

    # ------------------------------------------------------------------
    # users — last_seen_at for presence
    # ------------------------------------------------------------------
    op.add_column(
        "users",
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ------------------------------------------------------------------
    # message_read_receipts — per-user read state
    # ------------------------------------------------------------------
    op.create_table(
        "message_read_receipts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "read_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("message_id", "user_id", name="uq_receipt_msg_user"),
    )
    op.create_index("ix_read_receipts_message", "message_read_receipts", ["message_id"])
    op.create_index("ix_read_receipts_user", "message_read_receipts", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_read_receipts_user", table_name="message_read_receipts")
    op.drop_index("ix_read_receipts_message", table_name="message_read_receipts")
    op.drop_table("message_read_receipts")
    op.drop_column("users", "last_seen_at")
    op.drop_column("messages", "attachment_size")
    op.drop_column("messages", "attachment_name")
