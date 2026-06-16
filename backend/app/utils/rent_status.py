"""Compute rent payment status from due date (NZ flatting logic)."""

from datetime import date

from app.models.enums import RentStatus


def compute_rent_status(due_date: date, payment_date: date | None, today: date | None = None) -> RentStatus:
    """
    Rules:
    - paid if payment_date is set
    - upcoming if due_date > today
    - due_today if due_date == today
    - pending if 1 day late
    - overdue if 2+ days late
    """
    today = today or date.today()
    if payment_date:
        return RentStatus.PAID
    if due_date > today:
        return RentStatus.UPCOMING
    if due_date == today:
        return RentStatus.DUE_TODAY
    days_late = (today - due_date).days
    if days_late == 1:
        return RentStatus.PENDING
    return RentStatus.OVERDUE
