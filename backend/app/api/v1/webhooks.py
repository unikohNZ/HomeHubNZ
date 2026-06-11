from datetime import date, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import get_settings
from app.core.database import get_db
from app.models.enums import NotificationType
from app.models.lease import Lease
from app.models.maintenance import MaintenanceRequest
from app.models.property import Property
from app.models.rent import RentPayment
from app.repositories.user import UserRepository
from app.schemas.common import MessageResponse
from app.services.notification_service import NotificationService
from app.services.rent_service import RentService

router = APIRouter()
settings = get_settings()


def verify_webhook_secret(x_webhook_secret: str = Header(...)):
    if x_webhook_secret != settings.WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook secret")


@router.post("/rent-reminder", response_model=MessageResponse, dependencies=[Depends(verify_webhook_secret)])
async def rent_reminder_webhook(db: AsyncSession = Depends(get_db)):
    """n8n Workflow 1: Daily rent reminder at 8AM."""
    rent_service = RentService(db)
    notification_service = NotificationService(db)
    user_repo = UserRepository(db)

    await rent_service.mark_overdue()
    upcoming = await rent_service.get_upcoming(days=3)
    notified = 0

    for payment in upcoming:
        result = await db.execute(
            select(Lease).options(selectinload(Lease.property)).where(Lease.id == payment.lease_id)
        )
        lease = result.scalar_one_or_none()
        if not lease:
            continue

        prop_result = await db.execute(select(Property).where(Property.id == lease.property_id))
        prop = prop_result.scalar_one_or_none()
        if not prop:
            continue

        landlord = await user_repo.get_by_id(prop.owner_id)
        if landlord:
            await notification_service.create(
                landlord.id,
                NotificationType.RENT_DUE,
                "Upcoming Rent Due",
                f"Rent of ${payment.amount} due on {payment.due_date} for {prop.full_address}",
            )
            await notification_service.send_push(
                landlord, "Upcoming Rent Due", f"${payment.amount} due {payment.due_date}"
            )
            notified += 1

    return MessageResponse(message=f"Rent reminders sent: {notified}")


@router.post("/maintenance-notify", response_model=MessageResponse, dependencies=[Depends(verify_webhook_secret)])
async def maintenance_notify_webhook(
    maintenance_id: int,
    db: AsyncSession = Depends(get_db),
):
    """n8n Workflow 2: Maintenance status change notifications."""
    notification_service = NotificationService(db)
    user_repo = UserRepository(db)

    result = await db.execute(select(MaintenanceRequest).where(MaintenanceRequest.id == maintenance_id))
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Maintenance request not found")

    submitter = await user_repo.get_by_id(request.submitted_by)
    if submitter:
        await notification_service.create(
            submitter.id,
            NotificationType.MAINTENANCE,
            f"Maintenance Update: {request.title}",
            f"Status changed to {request.status.value}",
        )
        await notification_service.send_push(
            submitter, "Maintenance Update", f"{request.title}: {request.status.value}"
        )

    if request.assigned_to:
        contractor = await user_repo.get_by_id(request.assigned_to)
        if contractor:
            await notification_service.create(
                contractor.id,
                NotificationType.MAINTENANCE,
                f"New Job: {request.title}",
                request.description[:200],
            )

    return MessageResponse(message="Maintenance notifications sent")


@router.post("/inspection-reminder", response_model=MessageResponse, dependencies=[Depends(verify_webhook_secret)])
async def inspection_reminder_webhook(db: AsyncSession = Depends(get_db)):
    """n8n Workflow 3: Inspection reminders 7 days before."""
    from app.models.inspection import Inspection

    notification_service = NotificationService(db)
    user_repo = UserRepository(db)
    target_date = date.today() + timedelta(days=7)

    result = await db.execute(
        select(Inspection).where(Inspection.scheduled_date == target_date)
    )
    inspections = result.scalars().all()
    notified = 0

    for inspection in inspections:
        prop_result = await db.execute(select(Property).where(Property.id == inspection.property_id))
        prop = prop_result.scalar_one_or_none()
        if prop:
            landlord = await user_repo.get_by_id(prop.owner_id)
            if landlord:
                await notification_service.create(
                    landlord.id,
                    NotificationType.INSPECTION,
                    "Inspection Reminder",
                    f"Inspection scheduled for {prop.full_address} on {inspection.scheduled_date}",
                )
                notified += 1

    return MessageResponse(message=f"Inspection reminders sent: {notified}")


@router.post("/lease-expiry", response_model=MessageResponse, dependencies=[Depends(verify_webhook_secret)])
async def lease_expiry_webhook(db: AsyncSession = Depends(get_db)):
    """n8n Workflow 4: Lease expiry reminders."""
    notification_service = NotificationService(db)
    user_repo = UserRepository(db)
    target_date = date.today() + timedelta(days=30)

    result = await db.execute(
        select(Lease).where(Lease.end_date == target_date, Lease.is_active == True)  # noqa: E712
    )
    leases = result.scalars().all()
    notified = 0

    for lease in leases:
        prop_result = await db.execute(select(Property).where(Property.id == lease.property_id))
        prop = prop_result.scalar_one_or_none()
        if prop:
            landlord = await user_repo.get_by_id(prop.owner_id)
            if landlord:
                await notification_service.create(
                    landlord.id,
                    NotificationType.LEASE_EXPIRY,
                    "Lease Expiring Soon",
                    f"Lease for {prop.full_address} expires on {lease.end_date}",
                )
                notified += 1

    return MessageResponse(message=f"Lease expiry reminders sent: {notified}")
