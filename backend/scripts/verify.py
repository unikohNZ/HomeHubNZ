"""Quick verification script — run from backend/: python scripts/verify.py"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import check_database_connection
from app.models import Lease, MaintenanceRequest, Property, RentPayment, Role, User


async def main() -> int:
    models = [Role, User, Property, Lease, RentPayment, MaintenanceRequest]
    print("Models loaded:", ", ".join(m.__tablename__ for m in models))

    db_ok = await check_database_connection()
    print("Database:", "connected" if db_ok else "unavailable (start PostgreSQL with: docker compose up -d db)")

    return 0 if db_ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
