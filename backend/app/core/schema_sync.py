"""Idempotent schema alignment for dev databases created via create_all."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base, engine

# Columns that create_all does not add to existing tables.
_SCHEMA_PATCHES = [
    # users (002, 004)
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(30)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ",
    # properties (002, 003)
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Untitled Property'",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS max_flatmates INTEGER DEFAULT 4",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_rooms INTEGER DEFAULT 1",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_start DATE",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS lease_end DATE",
    # messages (004)
    "ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255)",
    "ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_size INTEGER",
    # maintenance_requests (model extensions not in 001)
    "ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS video_urls TEXT",
    "ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS completion_photos TEXT",
    "ALTER TABLE maintenance_requests ADD COLUMN IF NOT EXISTS ai_suggestion TEXT",
    # location (005)
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_location_name VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_latitude DOUBLE PRECISION",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_longitude DOUBLE PRECISION",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS region VARCHAR(100)",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'New Zealand'",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION",
    "ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION",
]


async def ensure_dev_schema(session: AsyncSession) -> None:
    """Apply missing columns/tables so ORM models match PostgreSQL."""
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    for stmt in _SCHEMA_PATCHES:
        await session.execute(text(stmt))

    # Extend rentstatus enum (002) — safe if already applied
    for value in ("upcoming", "due_today"):
        await session.execute(
            text(f"ALTER TYPE rentstatus ADD VALUE IF NOT EXISTS '{value}'")
        )
