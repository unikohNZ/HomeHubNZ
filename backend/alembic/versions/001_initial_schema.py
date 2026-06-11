"""Initial schema: roles, users, properties, leases, rent_payments, maintenance_requests

Revision ID: 001
Revises:
Create Date: 2026-06-11

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_roles_name"), "roles", ["name"], unique=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("refresh_token", sa.Text(), nullable=True),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_role_id"), "users", ["role_id"], unique=False)

    op.create_table(
        "properties",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("address_line1", sa.String(length=255), nullable=False),
        sa.Column("address_line2", sa.String(length=255), nullable=True),
        sa.Column("suburb", sa.String(length=100), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("postcode", sa.String(length=10), nullable=False),
        sa.Column(
            "property_type",
            sa.Enum("house", "apartment", "unit", "townhouse", "studio", name="propertytype"),
            nullable=False,
        ),
        sa.Column("bedrooms", sa.Integer(), nullable=False),
        sa.Column("bathrooms", sa.Integer(), nullable=False),
        sa.Column("rent_amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("bond_amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column(
            "rent_frequency",
            sa.Enum("weekly", "fortnightly", "monthly", name="rentfrequency"),
            nullable=False,
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_properties_owner_id"), "properties", ["owner_id"], unique=False)

    op.create_table(
        "leases",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("terms", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_leases_property_id"), "leases", ["property_id"], unique=False)

    op.create_table(
        "maintenance_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("submitted_by", sa.Integer(), nullable=False),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column(
            "priority",
            sa.Enum("low", "medium", "high", "urgent", name="maintenancepriority"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "submitted",
                "reviewing",
                "assigned",
                "in_progress",
                "completed",
                name="maintenancestatus",
            ),
            nullable=False,
        ),
        sa.Column("image_urls", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"]),
        sa.ForeignKeyConstraint(["submitted_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_maintenance_property_status", "maintenance_requests", ["property_id", "status"], unique=False)
    op.create_index(op.f("ix_maintenance_requests_property_id"), "maintenance_requests", ["property_id"], unique=False)
    op.create_index(op.f("ix_maintenance_requests_submitted_by"), "maintenance_requests", ["submitted_by"], unique=False)

    op.create_table(
        "rent_payments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lease_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("payment_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("paid", "pending", "overdue", name="rentstatus"),
            nullable=False,
        ),
        sa.Column("receipt_url", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["lease_id"], ["leases.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_rent_payments_lease_due", "rent_payments", ["lease_id", "due_date"], unique=False)
    op.create_index(op.f("ix_rent_payments_lease_id"), "rent_payments", ["lease_id"], unique=False)
    op.create_index("ix_rent_payments_status", "rent_payments", ["status"], unique=False)


def downgrade() -> None:
    op.drop_table("rent_payments")
    op.drop_table("maintenance_requests")
    op.drop_table("leases")
    op.drop_table("properties")
    op.drop_table("users")
    op.drop_table("roles")
    sa.Enum(name="rentstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="maintenancestatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="maintenancepriority").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="rentfrequency").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="propertytype").drop(op.get_bind(), checkfirst=True)
