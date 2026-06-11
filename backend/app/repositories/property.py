from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.property import Property
from app.repositories.base import BaseRepository


class PropertyRepository(BaseRepository[Property]):
    def __init__(self, db: AsyncSession):
        super().__init__(Property, db)

    async def get_by_owner(self, owner_id: int, skip: int = 0, limit: int = 100) -> List[Property]:
        result = await self.db.execute(
            select(Property).where(Property.owner_id == owner_id).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def get_with_relations(self, property_id: int) -> Optional[Property]:
        result = await self.db.execute(
            select(Property)
            .options(
                selectinload(Property.tenants),
                selectinload(Property.flatmates),
                selectinload(Property.leases),
            )
            .where(Property.id == property_id)
        )
        return result.scalar_one_or_none()
