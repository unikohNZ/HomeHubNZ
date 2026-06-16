from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import RentStatus, UserRole
from app.models.rent import RentPayment
from app.models.tenant import Tenant
from app.models.user import User
from app.repositories.rent import RentRepository
from app.schemas.rent import (
    RentAnalytics,
    RentPaymentCreate,
    RentPaymentResponse,
    RentPaymentSubmit,
    RentPaymentUpdate,
)
from app.services.supabase_storage_service import storage_service


def _enrich_payment(payment: RentPayment, tenant_name: Optional[str] = None, tenant_id: Optional[int] = None) -> RentPaymentResponse:
    lease = payment.lease
    prop = lease.property if lease else None
    return RentPaymentResponse(
        id=payment.id,
        lease_id=payment.lease_id,
        amount=payment.amount,
        due_date=payment.due_date,
        payment_date=payment.payment_date,
        status=payment.status,
        receipt_url=payment.receipt_url,
        notes=payment.notes,
        property_id=prop.id if prop else None,
        property_name=prop.name if prop else None,
        landlord_id=prop.owner_id if prop else None,
        tenant_id=tenant_id,
        tenant_name=tenant_name,
    )


class RentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rent_repo = RentRepository(db)

    async def _tenant_info(self, property_id: Optional[int]) -> tuple[Optional[int], Optional[str]]:
        if not property_id:
            return None, None
        result = await self.db.execute(
            select(Tenant)
            .where(Tenant.property_id == property_id, Tenant.is_active == True)  # noqa: E712
            .limit(1)
        )
        tenant = result.scalar_one_or_none()
        if not tenant:
            return None, None
        await self.db.refresh(tenant, ["user"])
        name = None
        if tenant.user:
            name = f"{tenant.user.first_name} {tenant.user.last_name}".strip()
        return tenant.user_id, name

    async def create_payment(self, data: RentPaymentCreate) -> RentPaymentResponse:
        payment = RentPayment(**data.model_dump())
        payment = await self.rent_repo.create(payment)
        payment = await self.rent_repo.get_by_id(payment.id)
        tenant_id, tenant_name = await self._tenant_info(payment.lease.property_id if payment and payment.lease else None)
        return _enrich_payment(payment, tenant_name, tenant_id)

    async def list_payments(self, user: User) -> List[RentPaymentResponse]:
        role = user.role.name if user.role else UserRole.TENANT.value
        is_landlord = role in (UserRole.LANDLORD.value, UserRole.PROPERTY_MANAGER.value, UserRole.ADMIN.value)
        payments = await self.rent_repo.get_for_user(user.id, is_landlord)
        results = []
        for payment in payments:
            tenant_id, tenant_name = await self._tenant_info(
                payment.lease.property_id if payment.lease else None
            )
            results.append(_enrich_payment(payment, tenant_name, tenant_id))
        return results

    async def get_payment(self, payment_id: int, user: User) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
        tenant_id, tenant_name = await self._tenant_info(
            payment.lease.property_id if payment.lease else None
        )
        return _enrich_payment(payment, tenant_name, tenant_id)

    async def update_payment(
        self, payment_id: int, data: RentPaymentUpdate, user: User
    ) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        patch = data.model_dump(exclude_unset=True)
        for key, value in patch.items():
            setattr(payment, key, value)
        payment = await self.rent_repo.update(payment)
        tenant_id, tenant_name = await self._tenant_info(
            payment.lease.property_id if payment.lease else None
        )
        return _enrich_payment(payment, tenant_name, tenant_id)

    async def upload_receipt(
        self, payment_id: int, file: UploadFile, user: User
    ) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        content = await file.read()
        ext = (file.filename or "receipt.pdf").split(".")[-1]
        url = await storage_service.upload_bytes(
            content,
            folder=f"receipts/{payment_id}",
            filename=f"receipt.{ext}",
            content_type=file.content_type or "application/octet-stream",
        )
        payment.receipt_url = url
        if payment.status == RentStatus.PENDING:
            payment.status = RentStatus.PAID
            payment.payment_date = payment.payment_date or date.today()
        payment = await self.rent_repo.update(payment)
        tenant_id, tenant_name = await self._tenant_info(
            payment.lease.property_id if payment.lease else None
        )
        return _enrich_payment(payment, tenant_name, tenant_id)

    async def get_ledger(self, lease_id: int) -> List[RentPaymentResponse]:
        payments = await self.rent_repo.get_by_lease(lease_id)
        results = []
        for payment in payments:
            tenant_id, tenant_name = await self._tenant_info(
                payment.lease.property_id if hasattr(payment, "lease") and payment.lease else None
            )
            results.append(_enrich_payment(payment, tenant_name, tenant_id))
        return results

    async def submit_payment(self, payment_id: int, data: RentPaymentSubmit, user: User) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        payment.payment_date = data.payment_date
        payment.receipt_url = data.receipt_url
        payment.notes = data.notes
        payment.status = RentStatus.PENDING
        payment = await self.rent_repo.update(payment)
        tenant_id, tenant_name = await self._tenant_info(
            payment.lease.property_id if payment.lease else None
        )
        return _enrich_payment(payment, tenant_name, tenant_id)

    async def approve_payment(self, payment_id: int, user: User) -> RentPaymentResponse:
        payment = await self.rent_repo.get_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

        payment.status = RentStatus.PAID
        payment.approved_by = user.id
        payment = await self.rent_repo.update(payment)
        tenant_id, tenant_name = await self._tenant_info(
            payment.lease.property_id if payment.lease else None
        )
        return _enrich_payment(payment, tenant_name, tenant_id)

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
