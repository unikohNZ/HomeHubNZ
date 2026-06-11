import json
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property
from app.models.tenant import Tenant
from app.models.user import User
from app.repositories.property import PropertyRepository
from app.repositories.user import UserRepository
from app.schemas.property import (
    AssignFlatmateRequest,
    AssignTenantRequest,
    PropertyCreate,
    PropertyResponse,
    PropertyUpdate,
)


class PropertyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.property_repo = PropertyRepository(db)
        self.user_repo = UserRepository(db)

    async def create(self, data: PropertyCreate, owner: User) -> PropertyResponse:
        prop = Property(owner_id=owner.id, **data.model_dump())
        prop = await self.property_repo.create(prop)
        return self._to_response(prop)

    async def get_all(self, user: User, skip: int = 0, limit: int = 100) -> List[PropertyResponse]:
        role = user.role.name
        if role in ("landlord", "property_manager", "admin"):
            properties = await self.property_repo.get_by_owner(user.id, skip, limit)
        else:
            properties = []
        return [self._to_response(p) for p in properties]

    async def get_by_id(self, property_id: int) -> PropertyResponse:
        prop = await self.property_repo.get_with_relations(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        return self._to_response(prop)

    async def update(self, property_id: int, data: PropertyUpdate, user: User) -> PropertyResponse:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        if prop.owner_id != user.id and user.role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(prop, field, value)
        prop = await self.property_repo.update(prop)
        return self._to_response(prop)

    async def delete(self, property_id: int, user: User) -> None:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        if prop.owner_id != user.id and user.role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        await self.property_repo.delete(prop)

    async def assign_tenant(self, property_id: int, data: AssignTenantRequest) -> dict:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

        tenant_user = await self.user_repo.get_by_email(data.email)
        if not tenant_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        tenant = Tenant(
            user_id=tenant_user.id,
            property_id=property_id,
            move_in_date=data.move_in_date,
            is_active=True,
            invitation_accepted=True,
        )
        self.db.add(tenant)
        await self.db.flush()
        return {"message": "Tenant assigned", "tenant_id": tenant.id}

    def _to_response(self, prop: Property) -> PropertyResponse:
        image_urls = None
        if prop.image_urls:
            try:
                image_urls = json.loads(prop.image_urls)
            except (json.JSONDecodeError, TypeError):
                image_urls = []
        return PropertyResponse(
            id=prop.id,
            owner_id=prop.owner_id,
            address_line1=prop.address_line1,
            address_line2=prop.address_line2,
            suburb=prop.suburb,
            city=prop.city,
            postcode=prop.postcode,
            property_type=prop.property_type,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            rent_amount=prop.rent_amount,
            bond_amount=prop.bond_amount,
            rent_frequency=prop.rent_frequency,
            description=prop.description,
            image_urls=image_urls,
            full_address=prop.full_address,
        )
