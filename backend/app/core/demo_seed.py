"""Idempotent demo data for local development and EXPO_PUBLIC_USE_MOCK=false."""

from __future__ import annotations

import json
import logging
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.chat import ChatRoom, Message
from app.models.enums import (
    ChatRoomType,
    HouseRuleType,
    MaintenancePriority,
    MaintenanceStatus,
    NotificationType,
    PropertyType,
    RentFrequency,
    RentStatus,
    UserRole,
)
from app.models.flatmate import Flatmate
from app.models.house_rule import HouseRule
from app.models.lease import Lease
from app.models.maintenance import MaintenanceRequest
from app.models.notification import Notification
from app.models.property import Property
from app.models.rent import RentPayment
from app.models.role import Role
from app.models.tenant import Tenant
from app.models.user import User

logger = logging.getLogger(__name__)

DEMO_PASSWORD = "123456"

DEMO_USERS = {
    "flatmate": {
        "email": "flatmate@homehub.co.nz",
        "first_name": "Mia",
        "last_name": "Thompson",
        "phone": "+64 21 555 0101",
        "role": UserRole.FLATMATE,
    },
    "landlord": {
        "email": "landlord@homehub.co.nz",
        "first_name": "Aroha",
        "last_name": "Williams",
        "phone": "+64 21 555 0202",
        "role": UserRole.LANDLORD,
    },
    "contractor": {
        "email": "contractor@homehub.co.nz",
        "first_name": "James",
        "last_name": "Patel",
        "phone": "+64 21 555 0303",
        "role": UserRole.CONTRACTOR,
    },
}

DEMO_PROPERTIES = [
    {
        "name": "Mount Maunganui Apartment",
        "address_line1": "42 Ocean Beach Road",
        "suburb": "Mount Maunganui",
        "city": "Tauranga",
        "postcode": "3116",
        "property_type": PropertyType.APARTMENT,
        "bedrooms": 3,
        "bathrooms": 2,
        "max_flatmates": 3,
        "available_rooms": 1,
        "rent_amount": Decimal("450.00"),
        "bond_amount": Decimal("1800.00"),
        "description": "Sunny apartment walking distance to the mount and local cafes.",
    },
    {
        "name": "Tauranga Townhouse",
        "address_line1": "18 Cameron Road",
        "suburb": "Tauranga Central",
        "city": "Tauranga",
        "postcode": "3110",
        "property_type": PropertyType.TOWNHOUSE,
        "bedrooms": 4,
        "bathrooms": 2,
        "max_flatmates": 4,
        "available_rooms": 2,
        "rent_amount": Decimal("520.00"),
        "bond_amount": Decimal("2080.00"),
        "description": "Modern townhouse close to the city centre and transport links.",
    },
    {
        "name": "Papamoa Beach House",
        "address_line1": "7 Pacific Parade",
        "suburb": "Papamoa Beach",
        "city": "Papamoa",
        "postcode": "3118",
        "property_type": PropertyType.HOUSE,
        "bedrooms": 5,
        "bathrooms": 3,
        "max_flatmates": 5,
        "available_rooms": 2,
        "rent_amount": Decimal("580.00"),
        "bond_amount": Decimal("2320.00"),
        "description": "Relaxed beach house with outdoor living and sea breezes.",
    },
]

HOUSE_RULES = [
    (HouseRuleType.SMOKING, "No smoking inside", "Smoking is not permitted anywhere inside the property."),
    (HouseRuleType.QUIET_HOURS, "Quiet hours after 10 PM", "Keep noise down after 10 PM on weeknights and 11 PM on weekends."),
    (HouseRuleType.OTHER, "Rent due every Friday", "Weekly rent is due every Friday via bank transfer."),
    (HouseRuleType.CLEANING, "Keep shared areas clean", "Clean up after yourself in the kitchen, bathroom, and living areas."),
]

MAINTENANCE_ITEMS = [
    (
        "Leaking tap",
        "Kitchen mixer tap dripping constantly — washer may need replacing.",
        MaintenancePriority.MEDIUM,
        MaintenanceStatus.SUBMITTED,
    ),
    (
        "Heat pump issue",
        "Heat pump in lounge not heating properly. Error light flashing.",
        MaintenancePriority.HIGH,
        MaintenanceStatus.IN_PROGRESS,
    ),
    (
        "Fence repair",
        "Back fence panel loose after recent wind. Needs securing before winter.",
        MaintenancePriority.LOW,
        MaintenanceStatus.ASSIGNED,
    ),
]


async def _get_role(session: AsyncSession, role: UserRole) -> Role:
    result = await session.execute(select(Role).where(Role.name == role.value))
    found = result.scalar_one_or_none()
    if not found:
        raise RuntimeError(f"Role '{role.value}' missing — run seed_roles first")
    return found


async def _get_or_create_user(session: AsyncSession, spec: dict[str, Any]) -> User:
    result = await session.execute(select(User).where(User.email == spec["email"]))
    user = result.scalar_one_or_none()
    role = await _get_role(session, spec["role"])
    hashed = get_password_hash(DEMO_PASSWORD)

    if user:
        user.first_name = spec["first_name"]
        user.last_name = spec["last_name"]
        user.phone = spec["phone"]
        user.role_id = role.id
        user.hashed_password = hashed
        user.is_active = True
        user.is_verified = True
        return user

    user = User(
        email=spec["email"],
        hashed_password=hashed,
        first_name=spec["first_name"],
        last_name=spec["last_name"],
        phone=spec["phone"],
        role_id=role.id,
        is_active=True,
        is_verified=True,
    )
    session.add(user)
    await session.flush()
    return user


async def _get_or_create_property(
    session: AsyncSession,
    spec: dict[str, Any],
    owner_id: int,
) -> Property:
    result = await session.execute(
        select(Property).where(Property.name == spec["name"], Property.owner_id == owner_id)
    )
    prop = result.scalar_one_or_none()
    if prop:
        for key, value in spec.items():
            setattr(prop, key, value)
        prop.rent_frequency = RentFrequency.WEEKLY
        prop.is_published = True
        return prop

    prop = Property(
        owner_id=owner_id,
        rent_frequency=RentFrequency.WEEKLY,
        is_published=True,
        **spec,
    )
    session.add(prop)
    await session.flush()
    return prop


async def _ensure_flatmate_assignment(
    session: AsyncSession,
    user_id: int,
    property_id: int,
) -> None:
    result = await session.execute(
        select(Flatmate).where(
            Flatmate.user_id == user_id,
            Flatmate.property_id == property_id,
        )
    )
    record = result.scalar_one_or_none()
    if record:
        record.is_active = True
        record.invitation_accepted = True
        return

    session.add(
        Flatmate(
            user_id=user_id,
            property_id=property_id,
            is_active=True,
            invitation_accepted=True,
            rent_share_percent=50.0,
        )
    )


async def _ensure_tenant_assignment(
    session: AsyncSession,
    user_id: int,
    property_id: int,
) -> None:
    result = await session.execute(
        select(Tenant).where(
            Tenant.user_id == user_id,
            Tenant.property_id == property_id,
        )
    )
    record = result.scalar_one_or_none()
    if record:
        record.is_active = True
        record.invitation_accepted = True
        return

    session.add(
        Tenant(
            user_id=user_id,
            property_id=property_id,
            move_in_date=date.today() - timedelta(days=90),
            is_active=True,
            invitation_accepted=True,
        )
    )


async def _get_or_create_lease(session: AsyncSession, property_id: int) -> Lease:
    result = await session.execute(
        select(Lease).where(Lease.property_id == property_id, Lease.is_active == True)  # noqa: E712
    )
    lease = result.scalar_one_or_none()
    if lease:
        return lease

    today = date.today()
    lease = Lease(
        property_id=property_id,
        start_date=today - timedelta(days=180),
        end_date=today + timedelta(days=185),
        terms="Fixed-term tenancy agreement — demo seed data.",
        is_active=True,
    )
    session.add(lease)
    await session.flush()
    return lease


async def _ensure_rent_payment(
    session: AsyncSession,
    lease_id: int,
    *,
    amount: Decimal,
    due_date: date,
    status: RentStatus,
    payment_date: date | None = None,
    notes: str,
) -> None:
    result = await session.execute(
        select(RentPayment).where(
            RentPayment.lease_id == lease_id,
            RentPayment.due_date == due_date,
            RentPayment.status == status,
        )
    )
    if result.scalar_one_or_none():
        return

    session.add(
        RentPayment(
            lease_id=lease_id,
            amount=amount,
            due_date=due_date,
            payment_date=payment_date,
            status=status,
            notes=notes,
        )
    )


async def _get_or_create_chat_room(
    session: AsyncSession,
    *,
    name: str,
    room_type: ChatRoomType,
    property_id: int | None,
    participant_ids: list[int],
    maintenance_id: int | None = None,
) -> ChatRoom:
    stmt = select(ChatRoom).where(ChatRoom.name == name)
    if property_id is not None:
        stmt = stmt.where(ChatRoom.property_id == property_id)
    result = await session.execute(stmt)
    room = result.scalar_one_or_none()
    participants_json = json.dumps(sorted(participant_ids))

    if room:
        room.room_type = room_type
        room.participant_ids = participants_json
        room.maintenance_id = maintenance_id
        return room

    room = ChatRoom(
        name=name,
        room_type=room_type,
        property_id=property_id,
        maintenance_id=maintenance_id,
        participant_ids=participants_json,
    )
    session.add(room)
    await session.flush()
    return room


async def _ensure_message(
    session: AsyncSession,
    *,
    room_id: int,
    sender_id: int,
    content: str,
    message_type: str = "text",
) -> None:
    result = await session.execute(
        select(Message).where(
            Message.room_id == room_id,
            Message.sender_id == sender_id,
            Message.content == content,
        )
    )
    if result.scalar_one_or_none():
        return

    session.add(
        Message(
            room_id=room_id,
            sender_id=sender_id,
            content=content,
            message_type=message_type,
            is_read=False,
        )
    )


async def _ensure_house_rule(
    session: AsyncSession,
    *,
    property_id: int,
    created_by: int,
    rule_type: HouseRuleType,
    title: str,
    content: str,
) -> None:
    result = await session.execute(
        select(HouseRule).where(
            HouseRule.property_id == property_id,
            HouseRule.title == title,
        )
    )
    if result.scalar_one_or_none():
        return

    session.add(
        HouseRule(
            property_id=property_id,
            created_by=created_by,
            rule_type=rule_type,
            title=title,
            content=content,
        )
    )


async def _ensure_notification(
    session: AsyncSession,
    *,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    body: str,
    is_read: bool = False,
) -> None:
    result = await session.execute(
        select(Notification).where(
            Notification.user_id == user_id,
            Notification.title == title,
        )
    )
    if result.scalar_one_or_none():
        return

    session.add(
        Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            body=body,
            is_read=is_read,
        )
    )


async def _ensure_maintenance(
    session: AsyncSession,
    *,
    property_id: int,
    submitted_by: int,
    assigned_to: int | None,
    title: str,
    description: str,
    priority: MaintenancePriority,
    status: MaintenanceStatus,
) -> MaintenanceRequest:
    result = await session.execute(
        select(MaintenanceRequest).where(
            MaintenanceRequest.property_id == property_id,
            MaintenanceRequest.title == title,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.description = description
        existing.priority = priority
        existing.status = status
        existing.assigned_to = assigned_to
        return existing

    request = MaintenanceRequest(
        property_id=property_id,
        submitted_by=submitted_by,
        assigned_to=assigned_to,
        title=title,
        description=description,
        priority=priority,
        status=status,
        category="general",
    )
    session.add(request)
    await session.flush()
    return request


async def seed_demo_data(session: AsyncSession) -> dict[str, Any]:
    """Populate demo users, properties, chat, rent, and related records (idempotent)."""
    flatmate = await _get_or_create_user(session, DEMO_USERS["flatmate"])
    landlord = await _get_or_create_user(session, DEMO_USERS["landlord"])
    contractor = await _get_or_create_user(session, DEMO_USERS["contractor"])

    properties: list[Property] = []
    for spec in DEMO_PROPERTIES:
        prop = await _get_or_create_property(session, spec, landlord.id)
        properties.append(prop)

    mount = properties[0]
    await _ensure_flatmate_assignment(session, flatmate.id, mount.id)
    await _ensure_tenant_assignment(session, flatmate.id, mount.id)

    lease = await _get_or_create_lease(session, mount.id)
    today = date.today()
    weekly_rent = mount.rent_amount

    await _ensure_rent_payment(
        session,
        lease.id,
        amount=weekly_rent,
        due_date=today - timedelta(days=7),
        status=RentStatus.PAID,
        payment_date=today - timedelta(days=7),
        notes="Demo — paid on time",
    )
    await _ensure_rent_payment(
        session,
        lease.id,
        amount=weekly_rent,
        due_date=today + timedelta(days=4),
        status=RentStatus.PENDING,
        notes="Demo — upcoming rent",
    )
    await _ensure_rent_payment(
        session,
        lease.id,
        amount=weekly_rent,
        due_date=today - timedelta(days=14),
        status=RentStatus.OVERDUE,
        notes="Demo — overdue rent",
    )

    for rule_type, title, content in HOUSE_RULES:
        await _ensure_house_rule(
            session,
            property_id=mount.id,
            created_by=landlord.id,
            rule_type=rule_type,
            title=title,
            content=content,
        )

    maintenance_records: list[MaintenanceRequest] = []
    for idx, (title, description, priority, status) in enumerate(MAINTENANCE_ITEMS):
        assigned = contractor.id if status != MaintenanceStatus.SUBMITTED else None
        req = await _ensure_maintenance(
            session,
            property_id=mount.id,
            submitted_by=flatmate.id,
            assigned_to=assigned,
            title=title,
            description=description,
            priority=priority,
            status=status,
        )
        maintenance_records.append(req)

    landlord_room = await _get_or_create_chat_room(
        session,
        name="Flatmate ↔ Landlord",
        room_type=ChatRoomType.LANDLORD,
        property_id=mount.id,
        participant_ids=[flatmate.id, landlord.id],
    )
    group_room = await _get_or_create_chat_room(
        session,
        name="Mount Maunganui Flatmates",
        room_type=ChatRoomType.FLATMATE_GROUP,
        property_id=mount.id,
        participant_ids=[flatmate.id, landlord.id],
    )
    contractor_room = await _get_or_create_chat_room(
        session,
        name="Contractor — Maintenance",
        room_type=ChatRoomType.MAINTENANCE,
        property_id=mount.id,
        participant_ids=[flatmate.id, landlord.id, contractor.id],
        maintenance_id=maintenance_records[0].id,
    )

    landlord_messages = [
        (flatmate.id, "Kia ora! Just checking the rent went through for this week?"),
        (landlord.id, "Ngā mihi Mia — yes, all received. Thanks for paying on time."),
        (flatmate.id, "Sweet as. The heat pump in the lounge is still playing up though."),
        (landlord.id, "I've logged it with James the contractor. He'll be in touch."),
    ]
    for sender_id, content in landlord_messages:
        await _ensure_message(session, room_id=landlord_room.id, sender_id=sender_id, content=content)

    group_messages = [
        (flatmate.id, "Anyone free to help tidy the kitchen this arvo?"),
        (landlord.id, "I'll be over Saturday — can bring cleaning supplies."),
        (flatmate.id, "Legend, thanks Aroha 🙌"),
    ]
    for sender_id, content in group_messages:
        await _ensure_message(session, room_id=group_room.id, sender_id=sender_id, content=content)

    contractor_messages = [
        (contractor.id, "Kia ora — I can look at the leaking tap tomorrow morning."),
        (flatmate.id, "That works for me. I'll be home before 9."),
        (landlord.id, "Thanks James. Please send photos once the fence panel is secured too."),
    ]
    for sender_id, content in contractor_messages:
        await _ensure_message(session, room_id=contractor_room.id, sender_id=sender_id, content=content)

    await _ensure_notification(
        session,
        user_id=flatmate.id,
        notification_type=NotificationType.RENT_DUE,
        title="Rent due soon",
        body=f"Your rent of ${weekly_rent} for {mount.name} is due this Friday.",
    )
    await _ensure_notification(
        session,
        user_id=flatmate.id,
        notification_type=NotificationType.MESSAGE,
        title="New message",
        body="Aroha Williams sent you a message about maintenance.",
    )
    await _ensure_notification(
        session,
        user_id=flatmate.id,
        notification_type=NotificationType.JOIN_REQUEST,
        title="Join request approved",
        body=f"Welcome to {mount.name}! Your flatmate request was approved.",
        is_read=True,
    )
    await _ensure_notification(
        session,
        user_id=landlord.id,
        notification_type=NotificationType.MAINTENANCE,
        title="Maintenance update",
        body="Heat pump issue is now in progress — James Patel assigned.",
    )

    await session.flush()

    prop_count = await session.scalar(select(func.count()).select_from(Property))
    msg_count = await session.scalar(select(func.count()).select_from(Message))

    summary = {
        "seeded_at": datetime.now(timezone.utc).isoformat(),
        "users": {
            "flatmate": flatmate.email,
            "landlord": landlord.email,
            "contractor": contractor.email,
        },
        "password": DEMO_PASSWORD,
        "properties": len(properties),
        "primary_flat": mount.name,
        "chat_rooms": 3,
        "messages_total": msg_count,
        "properties_total": prop_count,
    }
    logger.info("Demo seed complete: %s", summary)
    return summary
