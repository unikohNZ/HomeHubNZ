from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.permissions import Permission, require_permissions
from app.models.bill import Bill, Expense
from app.models.enums import BillStatus
from app.models.user import User
from app.schemas.bill import BillCreate, BillResponse, BillSplitRequest
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("", response_model=List[BillResponse])
async def list_bills(
    property_id: int = Query(...),
    current_user: User = Depends(require_permissions(Permission.BILL_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Bill).where(Bill.property_id == property_id))
    return [BillResponse.model_validate(b) for b in result.scalars().all()]


@router.post("", response_model=BillResponse, status_code=201)
async def create_bill(
    data: BillCreate,
    current_user: User = Depends(require_permissions(Permission.BILL_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    bill = Bill(**data.model_dump())
    db.add(bill)
    await db.flush()
    await db.refresh(bill)
    return BillResponse.model_validate(bill)


@router.post("/{bill_id}/split", response_model=MessageResponse)
async def split_bill(
    bill_id: int,
    data: BillSplitRequest,
    current_user: User = Depends(require_permissions(Permission.BILL_MANAGE)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bill not found")

    for split in data.splits:
        expense = Expense(
            bill_id=bill_id,
            user_id=split["user_id"],
            amount=bill.amount * (split["share_percent"] / 100),
            share_percent=split["share_percent"],
        )
        db.add(expense)
    await db.flush()
    return MessageResponse(message="Bill split created")


@router.put("/{bill_id}/pay", response_model=MessageResponse)
async def mark_bill_paid(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if bill:
        bill.status = BillStatus.PAID
        await db.flush()
    return MessageResponse(message="Bill marked as paid")
