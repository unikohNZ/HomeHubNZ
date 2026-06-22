from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    EllaChatRequest,
    EllaChatResponse,
    EllaContextResponse,
    MaintenanceCategorizeRequest,
    MaintenanceSuggestRequest,
    MaintenanceSuggestResponse,
    PropertyInsightsResponse,
)
from app.services.ai_service import AIService
from app.services.ella_service import EllaService

router = APIRouter()


@router.post("/maintenance/suggest", response_model=MaintenanceSuggestResponse)
async def suggest_maintenance_fix(
    data: MaintenanceSuggestRequest,
    current_user: User = Depends(get_current_user),
):
    service = AIService()
    return await service.suggest_maintenance_fix(data)


@router.post("/maintenance/categorize")
async def categorize_maintenance(
    data: MaintenanceCategorizeRequest,
    current_user: User = Depends(get_current_user),
):
    service = AIService()
    return await service.categorize_maintenance(data)


@router.get("/insights/{property_id}", response_model=PropertyInsightsResponse)
async def get_property_insights(
    property_id: int,
    current_user: User = Depends(get_current_user),
):
    service = AIService()
    return await service.get_property_insights(property_id)


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    data: AIChatRequest,
    current_user: User = Depends(get_current_user),
):
    service = AIService()
    return await service.chat_assistant(data)


@router.get("/ella/context", response_model=EllaContextResponse)
async def ella_context(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = EllaService(db)
    snap = await service.load_snapshot(current_user)
    next_rent = snap.next_payment
    return EllaContextResponse(
        role=snap.role,
        user_name=snap.user_name,
        activity=service.build_activity(snap),
        chat_preview=service.build_chat_preview(snap),
        property_count=snap.property_count,
        unread_notifications=snap.unread_notifications,
        maintenance_active_count=len(snap.maintenance_active),
        monthly_income=float(snap.monthly_income),
        collected_this_month=float(snap.collected_this_month),
        outstanding_rent=float(snap.outstanding_rent),
        next_rent_amount=float(next_rent["amount"]) if next_rent else None,
        next_rent_date=next_rent["due_date"] if next_rent else None,
        rent_days_until=next_rent["days_until"] if next_rent else None,
    )


@router.post("/ella/chat", response_model=EllaChatResponse)
async def ella_chat(
    data: EllaChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = EllaService(db)
    reply = await service.chat(data.message, data.action_id, current_user)
    return EllaChatResponse(reply=reply, data_source="database")
