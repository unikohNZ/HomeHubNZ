import json
from typing import List, Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import NotificationType
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        body: str,
        data: Optional[dict] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            body=body,
            data=json.dumps(data) if data else None,
        )
        self.db.add(notification)
        await self.db.flush()
        return notification

    async def get_for_user(self, user_id: int, skip: int = 0, limit: int = 50) -> List[NotificationResponse]:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return [NotificationResponse.model_validate(n) for n in result.scalars().all()]

    async def mark_read(self, notification_id: int, user_id: int) -> None:
        await self.db.execute(
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )

    async def mark_all_read(self, user_id: int) -> None:
        await self.db.execute(
            update(Notification).where(Notification.user_id == user_id).values(is_read=True)
        )

    async def get_unread_count(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
        )
        return result.scalar_one()

    async def register_device(self, user: User, push_token: str) -> None:
        user.push_token = push_token
        await self.db.flush()

    async def send_push(self, user: User, title: str, body: str, data: Optional[dict] = None) -> bool:
        if not user.push_token:
            return False
        # Expo push notification integration
        try:
            import httpx

            from app.core.config import get_settings

            settings = get_settings()
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://exp.host/--/api/v2/push/send",
                    json={
                        "to": user.push_token,
                        "title": title,
                        "body": body,
                        "data": data or {},
                    },
                    headers={"Authorization": f"Bearer {settings.EXPO_ACCESS_TOKEN}"},
                )
            return True
        except Exception:
            return False
