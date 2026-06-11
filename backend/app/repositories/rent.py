from datetime import date
from typing import List

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import RentStatus
from app.models.rent import RentPayment
from app.repositories.base import BaseRepository


class RentRepository(BaseRepository[RentPayment]):
    def __init__(self, db: AsyncSession):
        super().__init__(RentPayment, db)

    async def get_by_lease(self, lease_id: int) -> List[RentPayment]:
        result = await self.db.execute(
            select(RentPayment)
            .where(RentPayment.lease_id == lease_id)
            .order_by(RentPayment.due_date.desc())
        )
        return list(result.scalars().all())

    async def get_overdue(self) -> List[RentPayment]:
        result = await self.db.execute(
            select(RentPayment).where(
                and_(
                    RentPayment.status == RentStatus.PENDING,
                    RentPayment.due_date < date.today(),
                )
            )
        )
        return list(result.scalars().all())

    async def get_upcoming(self, days: int = 7) -> List[RentPayment]:
        from datetime import timedelta

        end_date = date.today() + timedelta(days=days)
        result = await self.db.execute(
            select(RentPayment).where(
                and_(
                    RentPayment.status == RentStatus.PENDING,
                    RentPayment.due_date >= date.today(),
                    RentPayment.due_date <= end_date,
                )
            )
        )
        return list(result.scalars().all())

    async def get_analytics(self, lease_ids: List[int]) -> dict:
        if not lease_ids:
            return {"total_collected": 0, "total_outstanding": 0, "overdue_count": 0}

        result = await self.db.execute(
            select(
                RentPayment.status,
                func.sum(RentPayment.amount).label("total"),
                func.count(RentPayment.id).label("count"),
            )
            .where(RentPayment.lease_id.in_(lease_ids))
            .group_by(RentPayment.status)
        )
        rows = result.all()
        analytics = {"total_collected": 0, "total_outstanding": 0, "overdue_count": 0, "paid_count": 0, "pending_count": 0}
        for row in rows:
            if row.status == RentStatus.PAID:
                analytics["total_collected"] = float(row.total or 0)
                analytics["paid_count"] = row.count
            elif row.status == RentStatus.OVERDUE:
                analytics["total_outstanding"] += float(row.total or 0)
                analytics["overdue_count"] = row.count
            elif row.status == RentStatus.PENDING:
                analytics["total_outstanding"] += float(row.total or 0)
                analytics["pending_count"] = row.count
        return analytics
