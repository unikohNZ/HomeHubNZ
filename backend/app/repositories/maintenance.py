from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import MaintenanceStatus
from app.models.maintenance import MaintenanceRequest
from app.repositories.base import BaseRepository


class MaintenanceRepository(BaseRepository[MaintenanceRequest]):
    def __init__(self, db: AsyncSession):
        super().__init__(MaintenanceRequest, db)

    async def get_by_property(self, property_id: int) -> List[MaintenanceRequest]:
        result = await self.db.execute(
            select(MaintenanceRequest)
            .where(MaintenanceRequest.property_id == property_id)
            .order_by(MaintenanceRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_status(self, status: MaintenanceStatus) -> List[MaintenanceRequest]:
        result = await self.db.execute(
            select(MaintenanceRequest).where(MaintenanceRequest.status == status)
        )
        return list(result.scalars().all())

    async def get_with_comments(self, request_id: int) -> Optional[MaintenanceRequest]:
        result = await self.db.execute(
            select(MaintenanceRequest)
            .options(selectinload(MaintenanceRequest.comments))
            .where(MaintenanceRequest.id == request_id)
        )
        return result.scalar_one_or_none()
