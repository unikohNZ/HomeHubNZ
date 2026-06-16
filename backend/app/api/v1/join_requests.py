from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.enums import JoinRequestStatus
from app.models.user import User
from app.schemas.join_request import JoinRequestCreate, JoinRequestResponse, JoinRequestReview
from app.services.join_request_service import JoinRequestService

router = APIRouter()


@router.post("", response_model=JoinRequestResponse, status_code=201)
async def request_to_join(
    data: JoinRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = JoinRequestService(db)
    return await service.create(data, current_user)


@router.get("/mine", response_model=List[JoinRequestResponse])
async def my_join_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = JoinRequestService(db)
    return await service.list_for_user(current_user)


@router.get("/property/{property_id}", response_model=List[JoinRequestResponse])
async def property_join_requests(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = JoinRequestService(db)
    return await service.list_for_property(property_id)


@router.patch("/{request_id}", response_model=JoinRequestResponse)
async def review_join_request(
    request_id: int,
    data: JoinRequestReview,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = JoinRequestService(db)
    return await service.review(request_id, data.status, current_user)
