from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import UserRole
from app.models.role import Role

DEFAULT_ROLES: list[tuple[str, str]] = [
    (UserRole.TENANT.value, "Tenant with access to assigned property"),
    (UserRole.FLATMATE.value, "Flatmate in a shared household"),
    (UserRole.LANDLORD.value, "Property owner and manager"),
    (UserRole.PROPERTY_MANAGER.value, "Manages multiple properties"),
    (UserRole.CONTRACTOR.value, "Maintenance contractor"),
    (UserRole.ADMIN.value, "Platform administrator"),
]


async def seed_roles(session: AsyncSession) -> None:
    for name, description in DEFAULT_ROLES:
        result = await session.execute(select(Role).where(Role.name == name))
        if result.scalar_one_or_none() is None:
            session.add(Role(name=name, description=description))
