from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    MaintenanceCategorizeRequest,
    MaintenanceSuggestRequest,
    MaintenanceSuggestResponse,
    PropertyInsightsResponse,
)
from app.services.ai_service import AIService

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
