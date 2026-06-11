from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.user import User
from app.schemas.rent import (
    RentAnalytics,
    RentPaymentCreate,
    RentPaymentResponse,
    RentPaymentSubmit,
)
from app.services.rent_service import RentService

router = APIRouter()


@router.get("/ledger", response_model=List[RentPaymentResponse])
async def get_rent_ledger(
    lease_id: int = Query(...),
    current_user: User = Depends(require_permissions(Permission.RENT_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    service = RentService(db)
    return await service.get_ledger(lease_id)


@router.get("/analytics", response_model=RentAnalytics)
async def get_rent_analytics(
    lease_ids: str = Query(..., description="Comma-separated lease IDs"),
    current_user: User = Depends(require_permissions(Permission.ANALYTICS_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    ids = [int(i) for i in lease_ids.split(",") if i.strip()]
    service = RentService(db)
    return await service.get_analytics(ids)


@router.post("/payments", response_model=RentPaymentResponse, status_code=201)
async def create_payment(
    data: RentPaymentCreate,
    current_user: User = Depends(require_permissions(Permission.RENT_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    service = RentService(db)
    return await service.create_payment(data)


@router.put("/payments/{payment_id}/submit", response_model=RentPaymentResponse)
async def submit_payment(
    payment_id: int,
    data: RentPaymentSubmit,
    current_user: User = Depends(require_permissions(Permission.RENT_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    service = RentService(db)
    return await service.submit_payment(payment_id, data, current_user)


@router.put("/payments/{payment_id}/approve", response_model=RentPaymentResponse)
async def approve_payment(
    payment_id: int,
    current_user: User = Depends(require_permissions(Permission.RENT_APPROVE)),
    db: AsyncSession = Depends(get_db),
):
    service = RentService(db)
    return await service.approve_payment(payment_id, current_user)


@router.get("/outstanding", response_model=List[RentPaymentResponse])
async def get_outstanding(
    lease_ids: str = Query(...),
    current_user: User = Depends(require_permissions(Permission.RENT_VIEW)),
    db: AsyncSession = Depends(get_db),
):
    ids = [int(i) for i in lease_ids.split(",") if i.strip()]
    service = RentService(db)
    return await service.get_outstanding(ids)
