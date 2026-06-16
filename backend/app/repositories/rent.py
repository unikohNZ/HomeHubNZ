from datetime import date
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import RentStatus
from app.models.lease import Lease
from app.models.property import Property
from app.models.rent import RentPayment
from app.models.tenant import Tenant
from app.repositories.base import BaseRepository


class RentRepository(BaseRepository[RentPayment]):
    def __init__(self, db: AsyncSession):
        super().__init__(RentPayment, db)

    async def get_by_id(self, payment_id: int) -> Optional[RentPayment]:
        result = await self.db.execute(
            select(RentPayment)
            .options(
                selectinload(RentPayment.lease).selectinload(Lease.property),
            )
            .where(RentPayment.id == payment_id)
        )
        return result.scalar_one_or_none()

    async def get_for_user(self, user_id: int, is_landlord: bool) -> List[RentPayment]:
        stmt = (
            select(RentPayment)
            .join(Lease, RentPayment.lease_id == Lease.id)
            .join(Property, Lease.property_id == Property.id)
            .options(
                selectinload(RentPayment.lease).selectinload(Lease.property),
            )
            .order_by(RentPayment.due_date.desc())
        )
        if is_landlord:
            stmt = stmt.where(Property.owner_id == user_id)
        else:
            tenant_props = select(Tenant.property_id).where(
                Tenant.user_id == user_id, Tenant.is_active == True  # noqa: E712
            )
            stmt = stmt.where(
                or_(
                    Property.id.in_(tenant_props),
                )
            )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

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
