from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import JoinRequestStatus, NotificationType
from app.models.flatmate import Flatmate
from app.models.join_request import JoinRequest
from app.models.notification import Notification
from app.models.property import Property
from app.models.user import User
from app.schemas.join_request import JoinRequestCreate, JoinRequestResponse


class JoinRequestService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: JoinRequestCreate, user: User) -> JoinRequestResponse:
        existing = await self.db.execute(
            select(JoinRequest).where(
                and_(
                    JoinRequest.property_id == data.property_id,
                    JoinRequest.user_id == user.id,
                    JoinRequest.status == JoinRequestStatus.PENDING,
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Request already pending")

        req = JoinRequest(
            property_id=data.property_id,
            user_id=user.id,
            message=data.message,
            status=JoinRequestStatus.PENDING,
        )
        self.db.add(req)
        await self.db.flush()
        return JoinRequestResponse.model_validate(req)

    async def list_for_property(self, property_id: int) -> list[JoinRequestResponse]:
        result = await self.db.execute(
            select(JoinRequest).where(JoinRequest.property_id == property_id).order_by(JoinRequest.created_at.desc())
        )
        return [JoinRequestResponse.model_validate(r) for r in result.scalars().all()]

    async def list_for_user(self, user: User) -> list[JoinRequestResponse]:
        result = await self.db.execute(
            select(JoinRequest).where(JoinRequest.user_id == user.id).order_by(JoinRequest.created_at.desc())
        )
        return [JoinRequestResponse.model_validate(r) for r in result.scalars().all()]

    async def review(self, request_id: int, status_value: JoinRequestStatus, reviewer: User) -> JoinRequestResponse:
        result = await self.db.execute(select(JoinRequest).where(JoinRequest.id == request_id))
        req = result.scalar_one_or_none()
        if not req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found")

        prop = await self.db.get(Property, req.property_id)
        if not prop or prop.owner_id != reviewer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        req.status = status_value
        req.reviewed_by = reviewer.id
        req.reviewed_at = datetime.now(timezone.utc)

        if status_value == JoinRequestStatus.APPROVED:
            self.db.add(
                Flatmate(
                    user_id=req.user_id,
                    property_id=req.property_id,
                    is_active=True,
                    invitation_accepted=True,
                )
            )
            prop.available_rooms = max(0, prop.available_rooms - 1)
            self.db.add(
                Notification(
                    user_id=req.user_id,
                    notification_type=NotificationType.JOIN_REQUEST,
                    title="Join request approved",
                    body=f"You have been approved to join {prop.name}.",
                    data=f'{{"property_id": {prop.id}}}',
                )
            )

        await self.db.flush()
        return JoinRequestResponse.model_validate(req)
