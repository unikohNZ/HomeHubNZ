import json
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.maintenance import MaintenanceComment, MaintenanceRequest
from app.models.user import User
from app.repositories.maintenance import MaintenanceRepository
from app.schemas.maintenance import (
    MaintenanceCommentCreate,
    MaintenanceCreate,
    MaintenanceResponse,
    MaintenanceUpdate,
)


class MaintenanceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MaintenanceRepository(db)

    async def create(self, data: MaintenanceCreate, user: User) -> MaintenanceResponse:
        request = MaintenanceRequest(
            property_id=data.property_id,
            submitted_by=user.id,
            title=data.title,
            description=data.description,
            priority=data.priority,
            image_urls=json.dumps(data.image_urls) if data.image_urls else None,
            video_urls=json.dumps(data.video_urls) if data.video_urls else None,
        )
        request = await self.repo.create(request)
        return self._to_response(request)

    async def get_by_property(self, property_id: int) -> List[MaintenanceResponse]:
        requests = await self.repo.get_by_property(property_id)
        return [self._to_response(r) for r in requests]

    async def update(self, request_id: int, data: MaintenanceUpdate) -> MaintenanceResponse:
        request = await self.repo.get_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

        for field, value in data.model_dump(exclude_unset=True).items():
            if field == "completion_photos" and value:
                setattr(request, field, json.dumps(value))
            else:
                setattr(request, field, value)
        request = await self.repo.update(request)
        return self._to_response(request)

    async def add_comment(self, request_id: int, data: MaintenanceCommentCreate, user: User) -> dict:
        request = await self.repo.get_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

        comment = MaintenanceComment(
            maintenance_id=request_id,
            user_id=user.id,
            content=data.content,
        )
        self.db.add(comment)
        await self.db.flush()
        return {"id": comment.id, "content": comment.content}

    async def assign_contractor(self, request_id: int, contractor_id: int) -> MaintenanceResponse:
        from app.models.enums import MaintenanceStatus

        request = await self.repo.get_by_id(request_id)
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

        request.assigned_to = contractor_id
        request.status = MaintenanceStatus.ASSIGNED
        request = await self.repo.update(request)
        return self._to_response(request)

    def _to_response(self, request: MaintenanceRequest) -> MaintenanceResponse:
        image_urls = None
        if request.image_urls:
            try:
                image_urls = json.loads(request.image_urls)
            except (json.JSONDecodeError, TypeError):
                image_urls = []
        return MaintenanceResponse(
            id=request.id,
            property_id=request.property_id,
            submitted_by=request.submitted_by,
            assigned_to=request.assigned_to,
            title=request.title,
            description=request.description,
            category=request.category,
            priority=request.priority,
            status=request.status,
            image_urls=image_urls,
            ai_suggestion=request.ai_suggestion,
        )
