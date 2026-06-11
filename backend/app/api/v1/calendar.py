from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.inspection import Inspection
from app.models.lease import Lease
from app.models.rent import RentPayment
from app.models.task import Task
from app.models.user import User
from app.schemas.common import CalendarEvent

router = APIRouter()


@router.get("/events", response_model=List[CalendarEvent])
async def get_calendar_events(
    property_id: int = Query(None),
    start_date: date = Query(None),
    end_date: date = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not start_date:
        start_date = date.today()
    if not end_date:
        end_date = start_date + timedelta(days=90)

    events: List[CalendarEvent] = []

    rent_result = await db.execute(
        select(RentPayment).where(
            RentPayment.due_date >= start_date,
            RentPayment.due_date <= end_date,
        )
    )
    for payment in rent_result.scalars().all():
        events.append(CalendarEvent(
            id=f"rent-{payment.id}",
            title=f"Rent Due: ${payment.amount}",
            date=payment.due_date.isoformat(),
            event_type="rent_due",
            color="#3B82F6",
        ))

    inspection_result = await db.execute(
        select(Inspection).where(
            Inspection.scheduled_date >= start_date,
            Inspection.scheduled_date <= end_date,
        )
    )
    for inspection in inspection_result.scalars().all():
        events.append(CalendarEvent(
            id=f"inspection-{inspection.id}",
            title="Property Inspection",
            date=inspection.scheduled_date.isoformat(),
            event_type="inspection",
            color="#8B5CF6",
        ))

    lease_result = await db.execute(
        select(Lease).where(
            Lease.end_date >= start_date,
            Lease.end_date <= end_date,
            Lease.is_active == True,  # noqa: E712
        )
    )
    for lease in lease_result.scalars().all():
        events.append(CalendarEvent(
            id=f"lease-{lease.id}",
            title="Lease Expiry",
            date=lease.end_date.isoformat(),
            event_type="lease_expiry",
            color="#EF4444",
        ))

    task_result = await db.execute(
        select(Task).where(
            Task.due_date >= start_date,
            Task.due_date <= end_date,
        )
    )
    for task in task_result.scalars().all():
        events.append(CalendarEvent(
            id=f"task-{task.id}",
            title=task.title,
            date=task.due_date.isoformat(),
            event_type="task",
            color="#10B981",
        ))

    return events
