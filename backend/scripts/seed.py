#!/usr/bin/env python3
"""Seed HomeHub NZ database with roles and demo data.

Usage (from backend/):
    python scripts/seed.py
    python scripts/seed.py --roles-only
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import app.models  # noqa: F401 — register all ORM mappers before seeding

from app.database import AsyncSessionLocal, check_database_connection
from app.core.schema_sync import ensure_dev_schema
from app.core.seed import seed_all


async def main() -> int:
    parser = argparse.ArgumentParser(description="Seed HomeHub NZ database")
    parser.add_argument(
        "--roles-only",
        action="store_true",
        help="Seed RBAC roles only (skip demo users, properties, chat, etc.)",
    )
    args = parser.parse_args()

    if not await check_database_connection():
        print("ERROR: Database unavailable. Start PostgreSQL first:")
        print("  docker compose up -d db")
        return 1

    async with AsyncSessionLocal() as session:
        await ensure_dev_schema(session)
        summary = await seed_all(session, include_demo=not args.roles_only)
        await session.commit()

    print("Seed completed successfully.")
    print(json.dumps(summary, indent=2, default=str))

    if summary.get("users"):
        print("\nDemo login accounts:")
        print(f"  Flatmate:   {summary['users']['flatmate']} / {summary.get('password', '123456')}")
        print(f"  Landlord:   {summary['users']['landlord']} / {summary.get('password', '123456')}")
        print(f"  Contractor: {summary['users']['contractor']} / {summary.get('password', '123456')}")

    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
