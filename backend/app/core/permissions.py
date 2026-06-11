from enum import Enum
from functools import wraps
from typing import Callable, List

from fastapi import Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User


class Permission(str, Enum):
    PROPERTY_CREATE = "property:create"
    PROPERTY_READ = "property:read"
    PROPERTY_UPDATE = "property:update"
    PROPERTY_DELETE = "property:delete"
    TENANT_ASSIGN = "tenant:assign"
    RENT_VIEW = "rent:view"
    RENT_MANAGE = "rent:manage"
    RENT_APPROVE = "rent:approve"
    MAINTENANCE_SUBMIT = "maintenance:submit"
    MAINTENANCE_MANAGE = "maintenance:manage"
    MAINTENANCE_ASSIGN = "maintenance:assign"
    INSPECTION_MANAGE = "inspection:manage"
    BILL_MANAGE = "bill:manage"
    CHAT_ACCESS = "chat:access"
    ADMIN_ACCESS = "admin:access"
    ANALYTICS_VIEW = "analytics:view"


ROLE_PERMISSIONS: dict[str, List[Permission]] = {
    "tenant": [
        Permission.PROPERTY_READ,
        Permission.RENT_VIEW,
        Permission.MAINTENANCE_SUBMIT,
        Permission.BILL_MANAGE,
        Permission.CHAT_ACCESS,
    ],
    "flatmate": [
        Permission.PROPERTY_READ,
        Permission.BILL_MANAGE,
        Permission.CHAT_ACCESS,
    ],
    "landlord": [
        Permission.PROPERTY_CREATE,
        Permission.PROPERTY_READ,
        Permission.PROPERTY_UPDATE,
        Permission.PROPERTY_DELETE,
        Permission.TENANT_ASSIGN,
        Permission.RENT_VIEW,
        Permission.RENT_MANAGE,
        Permission.RENT_APPROVE,
        Permission.MAINTENANCE_MANAGE,
        Permission.MAINTENANCE_ASSIGN,
        Permission.INSPECTION_MANAGE,
        Permission.BILL_MANAGE,
        Permission.CHAT_ACCESS,
        Permission.ANALYTICS_VIEW,
    ],
    "property_manager": [
        Permission.PROPERTY_CREATE,
        Permission.PROPERTY_READ,
        Permission.PROPERTY_UPDATE,
        Permission.TENANT_ASSIGN,
        Permission.RENT_VIEW,
        Permission.RENT_MANAGE,
        Permission.RENT_APPROVE,
        Permission.MAINTENANCE_MANAGE,
        Permission.MAINTENANCE_ASSIGN,
        Permission.INSPECTION_MANAGE,
        Permission.BILL_MANAGE,
        Permission.CHAT_ACCESS,
        Permission.ANALYTICS_VIEW,
    ],
    "contractor": [
        Permission.MAINTENANCE_MANAGE,
        Permission.CHAT_ACCESS,
    ],
    "admin": [p for p in Permission],
}


def has_permission(user: User, permission: Permission) -> bool:
    role_name = user.role.name if user.role else "tenant"
    return permission in ROLE_PERMISSIONS.get(role_name, [])


def require_permissions(*permissions: Permission) -> Callable:
    async def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        for perm in permissions:
            if not has_permission(current_user, perm):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Missing permission: {perm.value}",
                )
        return current_user

    return permission_checker
