"""Ella AI — database-backed context and replies for HomeHub NZ."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, timedelta
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import JoinRequestStatus, MaintenanceStatus, RentStatus, UserRole
from app.models.flatmate import Flatmate
from app.models.house_rule import HouseRule
from app.models.join_request import JoinRequest
from app.models.maintenance import MaintenanceRequest
from app.models.property import Property
from app.models.user import User
from app.repositories.property import PropertyRepository
from app.services.notification_service import NotificationService
from app.services.rent_service import RentService


def _fmt_currency(amount: Decimal | float | int) -> str:
    return f"${float(amount):,.0f}"


def _fmt_date(d: date) -> str:
    return d.strftime("%d %B %Y")


def _days_until(d: date) -> int:
    return (d - date.today()).days


def _user_display(user: User) -> str:
    return f"{user.first_name} {user.last_name}".strip() or user.email


def _is_landlord(user: User) -> bool:
    role = user.role.name if user.role else UserRole.TENANT.value
    return role in (UserRole.LANDLORD.value, UserRole.PROPERTY_MANAGER.value, UserRole.ADMIN.value)


@dataclass
class OverdueTenantRow:
    tenant_name: str
    property_name: str
    amount: Decimal
    days_overdue: int


@dataclass
class EllaSnapshot:
    role: str
    user_name: str
    preferred_location: Optional[str] = None
    property_locations: list = field(default_factory=list)
    properties: list = field(default_factory=list)
    my_property: Optional[dict] = None
    flatmates: list = field(default_factory=list)
    payments: list = field(default_factory=list)
    next_payment: Optional[dict] = None
    overdue_payments: list = field(default_factory=list)
    collected_this_month: Decimal = Decimal("0")
    outstanding_rent: Decimal = Decimal("0")
    monthly_income: Decimal = Decimal("0")
    occupancy_rate: float = 0.0
    maintenance_active: list = field(default_factory=list)
    house_rules: list = field(default_factory=list)
    unread_notifications: int = 0
    recent_notifications: list = field(default_factory=list)
    pending_join_requests: int = 0
    overdue_tenants: list = field(default_factory=list)
    property_count: int = 0


class EllaService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.property_repo = PropertyRepository(db)

    async def load_snapshot(self, user: User) -> EllaSnapshot:
        snap = EllaSnapshot(role=user.role.name, user_name=_user_display(user))
        snap.preferred_location = user.preferred_location_name
        landlord = _is_landlord(user)

        if landlord:
            props = await self.property_repo.get_by_owner(user.id, 0, 500)
            snap.property_count = len(props)
            snap.properties = [{"id": p.id, "name": p.name, "address": p.address_line1, "weekly_rent": float(p.rent_amount or 0), "suburb": p.suburb, "city": p.city} for p in props]
            snap.property_locations = sorted({f"{p.suburb}, {p.city}" for p in props})
            if props:
                occupied = sum(max(0, (p.max_flatmates or 1) - (p.available_rooms or 0)) for p in props)
                capacity = sum(p.max_flatmates or 1 for p in props)
                snap.occupancy_rate = round((occupied / capacity) * 100) if capacity else 0
                snap.monthly_income = sum((p.rent_amount or Decimal("0")) * 4 for p in props)
            for prop in props:
                maint = await self._maintenance_for_property(prop.id)
                snap.maintenance_active.extend(maint)
            pending = await self._pending_join_for_landlord(user.id)
            snap.pending_join_requests = len(pending)
        else:
            prop = await self.property_repo.get_by_flatmate(user.id)
            if prop:
                snap.my_property = {
                    "id": prop.id,
                    "name": prop.name,
                    "address": f"{prop.address_line1}, {prop.suburb}, {prop.city}",
                    "weekly_rent": float(prop.rent_amount or 0),
                    "lease_start": prop.lease_start.isoformat() if prop.lease_start else None,
                    "lease_end": prop.lease_end.isoformat() if prop.lease_end else None,
                }
                snap.flatmates = await self._flatmates_for_property(prop.id)
                snap.house_rules = await self._rules_for_property(prop.id)
                maint = await self._maintenance_for_property(prop.id)
                snap.maintenance_active.extend(maint)

        rent_service = RentService(self.db)
        payment_rows = await rent_service.list_payments(user)
        snap.payments = [
            {
                "id": p.id,
                "amount": float(p.amount),
                "due_date": p.due_date.isoformat(),
                "payment_date": p.payment_date.isoformat() if p.payment_date else None,
                "status": p.status.value if hasattr(p.status, "value") else str(p.status),
                "property_name": p.property_name,
                "tenant_name": p.tenant_name,
            }
            for p in payment_rows
        ]

        today = date.today()
        month_start = today.replace(day=1)
        unpaid_statuses = {RentStatus.PENDING.value, RentStatus.OVERDUE.value, RentStatus.UPCOMING.value, RentStatus.DUE_TODAY.value}

        for p in payment_rows:
            status_val = p.status.value if hasattr(p.status, "value") else str(p.status)
            if p.payment_date and p.payment_date >= month_start and status_val == RentStatus.PAID.value:
                snap.collected_this_month += p.amount
            if status_val in unpaid_statuses or (p.due_date < today and status_val != RentStatus.PAID.value):
                snap.outstanding_rent += p.amount

        unpaid = [
            p
            for p in payment_rows
            if (p.status.value if hasattr(p.status, "value") else str(p.status)) != RentStatus.PAID.value
        ]
        unpaid.sort(key=lambda x: x.due_date)
        if unpaid:
            nxt = unpaid[0]
            snap.next_payment = {
                "amount": float(nxt.amount),
                "due_date": nxt.due_date.isoformat(),
                "property_name": nxt.property_name,
                "days_until": _days_until(nxt.due_date),
            }

        for p in payment_rows:
            status_val = p.status.value if hasattr(p.status, "value") else str(p.status)
            if status_val == RentStatus.PAID.value:
                continue
            if p.due_date < today:
                snap.overdue_payments.append(p)
                if p.tenant_name and p.property_name:
                    snap.overdue_tenants.append(
                        OverdueTenantRow(
                            tenant_name=p.tenant_name,
                            property_name=p.property_name,
                            amount=p.amount,
                            days_overdue=max(1, (today - p.due_date).days),
                        )
                    )

        notif_service = NotificationService(self.db)
        snap.unread_notifications = await notif_service.get_unread_count(user.id)
        recent = await notif_service.get_for_user(user.id, 0, 5)
        snap.recent_notifications = [{"title": n.title, "body": n.body, "is_read": n.is_read} for n in recent]

        return snap

    async def _maintenance_for_property(self, property_id: int) -> list:
        result = await self.db.execute(
            select(MaintenanceRequest).where(
                MaintenanceRequest.property_id == property_id,
                MaintenanceRequest.status != MaintenanceStatus.COMPLETED,
            )
        )
        return [{"title": r.title, "status": r.status.value, "property_id": property_id} for r in result.scalars().all()]

    async def _rules_for_property(self, property_id: int) -> list:
        result = await self.db.execute(
            select(HouseRule).where(HouseRule.property_id == property_id).order_by(HouseRule.created_at.desc())
        )
        return [{"title": r.title, "content": r.content, "rule_type": r.rule_type.value} for r in result.scalars().all()]

    async def _flatmates_for_property(self, property_id: int) -> list:
        result = await self.db.execute(
            select(Flatmate)
            .options(selectinload(Flatmate.user))
            .where(Flatmate.property_id == property_id, Flatmate.is_active == True)  # noqa: E712
        )
        names = []
        for fm in result.scalars().all():
            if fm.user:
                names.append(_user_display(fm.user))
        return names

    async def _pending_join_for_landlord(self, owner_id: int) -> list:
        result = await self.db.execute(
            select(JoinRequest)
            .join(Property, JoinRequest.property_id == Property.id)
            .where(Property.owner_id == owner_id, JoinRequest.status == JoinRequestStatus.PENDING)
        )
        return list(result.scalars().all())

    async def chat(self, message: str, action_id: Optional[str], user: User) -> str:
        snap = await self.load_snapshot(user)
        text = (message or "").strip()
        if action_id:
            return self._action_reply(action_id, snap)
        matched = self._match_action_from_text(text, snap)
        if matched:
            return self._action_reply(matched, snap)
        return self._free_text_reply(text, snap)

    def _match_action_from_text(self, text: str, snap: EllaSnapshot) -> Optional[str]:
        lower = text.lower()
        landlord = _is_landlord_role(snap.role)
        if landlord:
            mapping = [
                (["rent collection", "check rent collection"], "landlord-collection"),
                (["overdue", "late tenant"], "landlord-overdue"),
                (["maintenance"], "landlord-maintenance"),
                (["propert"], "landlord-properties"),
                (["tenant", "join"], "landlord-tenants"),
                (["income", "report"], "landlord-income"),
                (["where", "location"], "landlord-locations"),
                (["message", "chat"], "landlord-messages"),
            ]
        else:
            mapping = [
                (["rent", "balance", "pay"], "tenant-rent"),
                (["my flat", "flat"], "tenant-flat"),
                (["flatmate"], "tenant-flatmates"),
                (["rule"], "tenant-rules"),
                (["maint", "repair", "fix"], "tenant-maintenance"),
                (["notice", "notification"], "tenant-notices"),
                (["near me", "rental", "find flat"], "tenant-rentals"),
                (["message", "chat"], "tenant-messages"),
            ]
        for keywords, action in mapping:
            if any(k in lower for k in keywords):
                return action
        return None

    def _action_reply(self, action_id: str, snap: EllaSnapshot) -> str:
        landlord = _is_landlord_role(snap.role)
        if landlord:
            return self._landlord_action(action_id, snap)
        return self._tenant_action(action_id, snap)

    def _tenant_action(self, action_id: str, snap: EllaSnapshot) -> str:
        if action_id == "tenant-rent":
            if snap.next_payment:
                amt = _fmt_currency(snap.next_payment["amount"])
                due = _fmt_date(date.fromisoformat(snap.next_payment["due_date"]))
                days = snap.next_payment["days_until"]
                if days < 0:
                    status = f"overdue by {abs(days)} day{'s' if abs(days) != 1 else ''}"
                elif days == 0:
                    status = "due today"
                else:
                    status = "on track"
                return f"Your next rent is {amt} due on {due}. You're currently {status}."
            if not snap.payments:
                return "I don't see any rent payments in your account yet. Check Payments once your landlord sets up your lease."
            return "You're all caught up on rent — no upcoming payments due right now."

        if action_id == "tenant-flat":
            if snap.my_property:
                p = snap.my_property
                return (
                    f"{p['name']} is your flat at {p['address']}. "
                    f"Weekly rent is {_fmt_currency(p['weekly_rent'])}. Open My Flat for lease dates and details."
                )
            return "You're not linked to a flat yet. Browse properties and request to join from My Flat."

        if action_id == "tenant-flatmates":
            if snap.flatmates:
                names = ", ".join(snap.flatmates)
                return f"Your flatmates: {names}. Message them from More → Messages."
            return "No flatmates on file yet. They'll appear here once everyone has joined your flat."

        if action_id == "tenant-maintenance":
            active = snap.maintenance_active
            if active:
                titles = ", ".join(m["title"].lower() for m in active[:3])
                return f"You have {len(active)} active maintenance request{'s' if len(active) != 1 else ''}: {titles}. Tell me what's broken and I'll help you log another."
            return "No open maintenance requests. Tell me what needs fixing and I'll help create one."

        if action_id == "tenant-rules":
            if snap.house_rules:
                summaries = "; ".join(r["content"][:80] for r in snap.house_rules[:4])
                return f"Your house rules from the database: {summaries}"
            return "No house rules saved for your flat yet. Your landlord can add them under House Rules."

        if action_id == "tenant-notices":
            if snap.unread_notifications == 0:
                return "You're all caught up — no unread notices."
            if snap.recent_notifications:
                titles = ", ".join(n["title"] for n in snap.recent_notifications[:3] if not n["is_read"])
                return f"You have {snap.unread_notifications} unread notice{'s' if snap.unread_notifications != 1 else ''}: {titles}."
            return f"You have {snap.unread_notifications} unread notice{'s' if snap.unread_notifications != 1 else ''}."

        if action_id == "tenant-rentals":
            loc = snap.preferred_location or "your saved area"
            return f"You're currently searching near {loc}. I can help find available flats nearby — open Find Rentals from Home or My Flat."

        if action_id == "tenant-messages":
            return "Open Messages from the bottom tab to chat with your landlord and flatmates."

        if action_id == "tenant-ask":
            return "Ask me anything about your flat, rent, flatmates, house rules, maintenance, or documents. Just give me a meow! 😸"

        return "How can I help with your flat today?"

    def _landlord_action(self, action_id: str, snap: EllaSnapshot) -> str:
        income = snap.monthly_income
        collected = snap.collected_this_month
        outstanding = snap.outstanding_rent

        if action_id == "landlord-collection":
            return (
                f"Your expected monthly income is {_fmt_currency(income)}. "
                f"You have {_fmt_currency(collected)} collected this month and {_fmt_currency(outstanding)} outstanding."
            )

        if action_id in ("landlord-overdue", "landlord-tenants"):
            overdue = snap.overdue_tenants
            join = snap.pending_join_requests
            join_line = f" You have {join} pending join request{'s' if join != 1 else ''}." if join else ""
            if not overdue:
                return f"All tenants are up to date with rent.{join_line}"
            first = overdue[0]
            extra = f" {len(overdue) - 1} more tenant{'s' if len(overdue) - 1 != 1 else ''} also overdue." if len(overdue) > 1 else ""
            return (
                f"You have {len(overdue)} overdue tenant{'s' if len(overdue) != 1 else ''}. "
                f"{first.property_name} has {_fmt_currency(first.amount)} overdue by {first.days_overdue} "
                f"day{'s' if first.days_overdue != 1 else ''}.{extra}{join_line}"
            )

        if action_id == "landlord-maintenance":
            active = snap.maintenance_active
            if not active:
                return "No active maintenance requests — your properties are all clear."
            if len(active) >= 2:
                return f"You have {len(active)} active maintenance requests: {active[0]['title'].lower()} and {active[1]['title'].lower()}."
            return f"You have 1 active maintenance request: {active[0]['title'].lower()}."

        if action_id == "landlord-properties":
            n = snap.property_count
            if n == 0:
                return "You don't have any properties yet. Tap Properties to create your first listing."
            names = ", ".join(p["name"] for p in snap.properties[:3])
            suffix = f" including {names}" if names else ""
            return f"You currently manage {n} propert{'y' if n == 1 else 'ies'}{suffix}. Tap Properties to create, edit, or delete listings."

        if action_id == "landlord-join":
            n = snap.pending_join_requests
            return f"You currently have {n} pending join request{'s' if n != 1 else ''}."

        if action_id == "landlord-reminder":
            return "I can help prepare a friendly rent reminder message for tenants with pending or overdue payments."

        if action_id == "landlord-income":
            return (
                f"Monthly income forecast: {_fmt_currency(income)}. Collected: {_fmt_currency(collected)}. "
                f"Outstanding: {_fmt_currency(outstanding)}. Occupancy: {snap.occupancy_rate:.0f}%. Open Payments for the full report."
            )

        if action_id == "landlord-locations":
            locs = snap.property_locations
            if not locs:
                return "You don't have any properties with locations saved yet."
            return f"You have properties in {', '.join(locs)}."

        if action_id == "landlord-messages":
            return "Open Messages from the bottom tab to chat with tenants and contractors."

        if action_id == "landlord-ask":
            return "Ask me about rent collection, tenants, maintenance, properties, or your income report. I'm on it! 😸"

        return "How can I help manage your properties today?"

    def _free_text_reply(self, text: str, snap: EllaSnapshot) -> str:
        lower = text.lower()
        if "thank" in lower:
            return "You're welcome 😺 Anything else I can help with?"
        matched = self._match_action_from_text(text, snap)
        if matched:
            return self._action_reply(matched, snap)
        if _is_landlord_role(snap.role):
            return self._landlord_action("landlord-ask", snap)
        return self._tenant_action("tenant-ask", snap)

    def build_activity(self, snap: EllaSnapshot) -> list:
        items = []
        if _is_landlord_role(snap.role):
            if snap.outstanding_rent > 0:
                items.append({"id": "outstanding", "icon": "💰", "text": f"{_fmt_currency(snap.outstanding_rent)} outstanding rent", "time": "This month"})
            if snap.overdue_tenants:
                t = snap.overdue_tenants[0]
                items.append({"id": "overdue", "icon": "⚠️", "text": f"{t.tenant_name} — {_fmt_currency(t.amount)} overdue", "time": f"{t.days_overdue} days"})
            if snap.maintenance_active:
                items.append({"id": "maint", "icon": "🔧", "text": f"{len(snap.maintenance_active)} active maintenance request{'s' if len(snap.maintenance_active) != 1 else ''}", "time": "Recently"})
            if snap.pending_join_requests:
                items.append({"id": "join", "icon": "👥", "text": f"{snap.pending_join_requests} pending join request{'s' if snap.pending_join_requests != 1 else ''}", "time": "Today"})
            if not items:
                items.append({"id": "ok", "icon": "✨", "text": "Your portfolio is looking healthy today", "time": "Just now"})
            return items[:3]

        if snap.next_payment:
            days = snap.next_payment["days_until"]
            label = "today" if days == 0 else f"in {days} days" if days > 0 else f"{abs(days)} days overdue"
            items.append({"id": "rent", "icon": "🔔", "text": f"Rent due {label}", "time": snap.next_payment["due_date"]})
        if snap.maintenance_active:
            items.append({"id": "maint", "icon": "🔧", "text": "Maintenance request updated", "time": "Recently"})
        if snap.unread_notifications:
            items.append({"id": "notif", "icon": "📢", "text": f"{snap.unread_notifications} new notice{'s' if snap.unread_notifications != 1 else ''}", "time": "Today"})
        if not items:
            items.append({"id": "ok", "icon": "✨", "text": "Everything looks good at your flat today", "time": "Just now"})
        return items[:3]

    def build_chat_preview(self, snap: EllaSnapshot) -> list:
        if _is_landlord_role(snap.role):
            return [
                {"role": "assistant", "content": f"Your expected monthly income is {_fmt_currency(snap.monthly_income)}. You have {_fmt_currency(snap.outstanding_rent)} outstanding across your properties."},
                {"role": "user", "content": "Thanks Ella!"},
                {"role": "assistant", "content": "You're welcome 😺"},
            ]
        if snap.next_payment:
            amt = _fmt_currency(snap.next_payment["amount"])
            due = _fmt_date(date.fromisoformat(snap.next_payment["due_date"]))
            line = f"Your next rent payment of {amt} is due on {due}."
        else:
            line = "You're all caught up on rent right now."
        return [
            {"role": "assistant", "content": line},
            {"role": "user", "content": "Thanks Ella!"},
            {"role": "assistant", "content": "You're welcome 😺"},
        ]


def _is_landlord_role(role: str) -> bool:
    return role in (UserRole.LANDLORD.value, UserRole.PROPERTY_MANAGER.value, UserRole.ADMIN.value)
