from fastapi import APIRouter

from app.api.v1 import (
    ai,
    auth,
    bills,
    calendar,
    chat,
    house_rules,
    inspections,
    join_requests,
    maintenance,
    notifications,
    profile,
    properties,
    rent,
    uploads,
    users,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(properties.router, prefix="/properties", tags=["Properties"])
api_router.include_router(join_requests.router, prefix="/join-requests", tags=["Join Requests"])
api_router.include_router(house_rules.router, prefix="/house-rules", tags=["House Rules"])
api_router.include_router(rent.router, prefix="/rent", tags=["Rent"])
api_router.include_router(bills.router, prefix="/bills", tags=["Bills"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["Maintenance"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["Calendar"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["Uploads"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
