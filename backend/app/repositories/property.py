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
            select(Property)
            .options(selectinload(Property.flatmates))
            .where(Property.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_flatmate(self, user_id: int) -> Optional[Property]:
        from app.models.flatmate import Flatmate

        result = await self.db.execute(
            select(Property)
            .join(Flatmate, Flatmate.property_id == Property.id)
            .options(selectinload(Property.flatmates))
            .where(
                Flatmate.user_id == user_id,
                Flatmate.is_active.is_(True),
                Flatmate.invitation_accepted.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def search_published(
        self,
        *,
        city: str | None = None,
        min_rent=None,
        max_rent=None,
        min_rooms: int | None = None,
        min_bedrooms: int | None = None,
        property_type=None,
        query: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Property]:
        stmt = select(Property).where(Property.is_published.is_(True))
        if city:
            stmt = stmt.where(Property.city.ilike(f"%{city}%"))
        if min_rent is not None:
            stmt = stmt.where(Property.rent_amount >= min_rent)
        if max_rent is not None:
            stmt = stmt.where(Property.rent_amount <= max_rent)
        if min_rooms is not None:
            stmt = stmt.where(Property.available_rooms >= min_rooms)
        if min_bedrooms is not None:
            stmt = stmt.where(Property.bedrooms >= min_bedrooms)
        if property_type is not None:
            stmt = stmt.where(Property.property_type == property_type)
        if query:
            like = f"%{query}%"
            stmt = stmt.where(
                (Property.name.ilike(like))
                | (Property.address_line1.ilike(like))
                | (Property.suburb.ilike(like))
                | (Property.city.ilike(like))
            )
        result = await self.db.execute(stmt.offset(skip).limit(limit))
        return list(result.scalars().all())

    async def get_with_relations(self, property_id: int) -> Optional[Property]:
        result = await self.db.execute(
            select(Property)
            .options(
                selectinload(Property.tenants),
                selectinload(Property.flatmates),
                selectinload(Property.leases),
                selectinload(Property.images),
            )
            .where(Property.id == property_id)
        )
        return result.scalar_one_or_none()
