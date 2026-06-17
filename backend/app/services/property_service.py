import json
from datetime import date
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property
from app.models.property_image import PropertyImage
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
        if owner.role.name not in ("landlord", "property_manager", "admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only landlords can create properties",
            )

        max_flatmates = data.max_flatmates or max(data.bedrooms, data.available_rooms + 1)
        prop = Property(
            owner_id=owner.id,
            name=data.name,
            address_line1=data.address,
            suburb=data.suburb,
            city=data.city,
            postcode=data.postcode,
            property_type=data.property_type,
            bedrooms=data.bedrooms,
            bathrooms=data.bathrooms,
            rent_amount=data.weekly_rent,
            bond_amount=data.bond_amount,
            available_rooms=data.available_rooms,
            max_flatmates=max_flatmates,
            description=data.description,
            lease_start=data.lease_start,
            lease_end=data.lease_end,
        )
        prop = await self.property_repo.create(prop)
        return self._to_response(prop)

    async def get_all(self, user: User, skip: int = 0, limit: int = 100) -> List[PropertyResponse]:
        role = user.role.name
        if role in ("landlord", "property_manager", "admin"):
            properties = await self.property_repo.get_by_owner(user.id, skip, limit)
        else:
            properties = []
        return [self._to_response(p) for p in properties]

    async def get_my_flat(self, user: User) -> Optional[PropertyResponse]:
        if user.role.name not in ("flatmate", "tenant"):
            return None
        prop = await self.property_repo.get_by_flatmate(user.id)
        if not prop:
            return None
        return self._to_response(prop)

    async def search(self, **filters) -> List[PropertyResponse]:
        properties = await self.property_repo.search_published(**filters)
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

        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            if field == "address":
                prop.address_line1 = value
            elif field == "weekly_rent":
                prop.rent_amount = value
            else:
                setattr(prop, field, value)

        prop = await self.property_repo.update(prop)
        loaded = await self.property_repo.get_with_relations(property_id)
        return self._to_response(loaded or prop)

    async def delete(self, property_id: int, user: User) -> None:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        if prop.owner_id != user.id and user.role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        await self.property_repo.delete(prop)

    async def update_photo(self, property_id: int, image_url: str, user: User) -> PropertyResponse:
        prop = await self.property_repo.get_by_id(property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        if prop.owner_id != user.id and user.role.name != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        # Mark existing primary images as non-primary
        loaded = await self.property_repo.get_with_relations(property_id)
        if loaded and loaded.images:
            for img in loaded.images:
                if img.is_primary:
                    img.is_primary = False

        prop.image_url = image_url
        image_row = PropertyImage(
            property_id=property_id,
            url=image_url,
            is_primary=True,
            sort_order=0,
        )
        self.db.add(image_row)
        prop = await self.property_repo.update(prop)
        loaded = await self.property_repo.get_with_relations(property_id)
        return self._to_response(loaded or prop)

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

    def _flatmate_count(self, prop: Property) -> int:
        if prop.flatmates:
            return sum(
                1
                for f in prop.flatmates
                if f.is_active and getattr(f, "invitation_accepted", False)
            )
        return max(0, prop.max_flatmates - prop.available_rooms)

    def _format_date(self, value: Optional[date]) -> Optional[str]:
        return value.isoformat() if value else None

    def _to_response(self, prop: Property) -> PropertyResponse:
        image_urls: Optional[list[str]] = None
        if prop.images:
            image_urls = [img.url for img in sorted(prop.images, key=lambda i: (not i.is_primary, i.sort_order))]
        elif prop.image_url:
            image_urls = [prop.image_url]

        flatmate_count = self._flatmate_count(prop)
        occupancy = f"{flatmate_count}/{prop.max_flatmates}"

        return PropertyResponse(
            id=prop.id,
            owner_id=prop.owner_id,
            name=prop.name,
            address=prop.address_line1,
            city=prop.city,
            suburb=prop.suburb,
            postcode=prop.postcode,
            description=prop.description,
            weekly_rent=prop.rent_amount,
            bond_amount=prop.bond_amount,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            available_rooms=prop.available_rooms,
            max_flatmates=prop.max_flatmates,
            flatmate_count=flatmate_count,
            occupancy=occupancy,
            property_type=prop.property_type,
            rent_frequency=prop.rent_frequency,
            lease_start=prop.lease_start,
            lease_end=prop.lease_end,
            image_urls=image_urls,
            full_address=prop.full_address,
            address_line1=prop.address_line1,
            rent_amount=prop.rent_amount,
        )

