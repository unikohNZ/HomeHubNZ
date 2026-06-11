from datetime import date
from decimal import Decimal
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import RentStatus
from app.models.rent import RentPayment
from app.models.user import User
from app.repositories.rent import RentRepository
from app.schemas.rent import RentAnalytics, RentPaymentCreate, RentPaymentResponse, RentPaymentSubmit


class RentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rent_repo = RentRepository(db)

    async def create_payment(self, data: RentPaymentCreate) -> RentPaymentResponse:
        payment = RentPayment(**data.model_dump())
        payment = await self.rent_repo.create(payment)
        return RentPaymentResponse.model_validate(payment)

    async def get_ledger(self, lease_id: int) -> List[RentPaymentResponse]:
        payments = await self.rent_repo.get_by_lease(lease_id)
        return [RentPaymentResponse.model_validate(p) for p in payments]

    async def submit_payment(self, payment_id: int, data: RentPaymentSubmit, user: User) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        payment.payment_date = data.payment_date
        payment.receipt_url = data.receipt_url
        payment.notes = data.notes
        payment.status = RentStatus.PENDING
        payment = await self.rent_repo.update(payment)
        return RentPaymentResponse.model_validate(payment)

    async def approve_payment(self, payment_id: int, user: User) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        payment.status = RentStatus.PAID
        payment.approved_by = user.id
        payment = await self.rent_repo.update(payment)
        return RentPaymentResponse.model_validate(payment)

    async def get_outstanding(self, lease_ids: List[int]) -> List[RentPaymentResponse]:
        all_payments = []
        for lease_id in lease_ids:
            payments = await self.rent_repo.get_by_lease(lease_id)
            all_payments.extend([p for p in payments if p.status != RentStatus.PAID])
        return [RentPaymentResponse.model_validate(p) for p in all_payments]

    async def get_analytics(self, lease_ids: List[int]) -> RentAnalytics:
        raw = await self.rent_repo.get_analytics(lease_ids)
        total = raw["total_collected"] + raw["total_outstanding"]
        rate = (raw["total_collected"] / total * 100) if total > 0 else 0.0
        return RentAnalytics(
            total_collected=Decimal(str(raw["total_collected"])),
            total_outstanding=Decimal(str(raw["total_outstanding"])),
            overdue_count=raw["overdue_count"],
            paid_count=raw.get("paid_count", 0),
            pending_count=raw.get("pending_count", 0),
            monthly_income=[],
            collection_rate=round(rate, 2),
        )

    async def mark_overdue(self) -> int:
        overdue = await self.rent_repo.get_overdue()
        count = 0
        for payment in overdue:
            payment.status = RentStatus.OVERDUE
            await self.rent_repo.update(payment)
            count += 1
        return count

    async def get_upcoming(self, days: int = 7) -> List[RentPaymentResponse]:
        payments = await self.rent_repo.get_upcoming(days)
        return [RentPaymentResponse.model_validate(p) for p in payments]
