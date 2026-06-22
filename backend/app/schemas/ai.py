from typing import List, Optional

from pydantic import BaseModel, Field


class MaintenanceSuggestRequest(BaseModel):
    title: str
    description: str


class MaintenanceSuggestResponse(BaseModel):
    category: str
    suggested_fixes: List[str]
    estimated_cost_nzd: Optional[str] = None
    urgency: str


class MaintenanceCategorizeRequest(BaseModel):
    description: str


class PropertyInsightsResponse(BaseModel):
    property_id: int
    maintenance_trends: List[dict]
    cost_predictions: dict
    recommendations: List[str]


class AIChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    context: Optional[str] = None


class EllaChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    action_id: Optional[str] = None


class EllaActivityItem(BaseModel):
    id: str
    icon: str
    text: str
    time: Optional[str] = None


class EllaPreviewMessage(BaseModel):
    role: str
    content: str


class EllaContextResponse(BaseModel):
    role: str
    user_name: str
    data_source: str = "database"
    activity: List[EllaActivityItem]
    chat_preview: List[EllaPreviewMessage]
    property_count: int = 0
    unread_notifications: int = 0
    maintenance_active_count: int = 0
    monthly_income: Optional[float] = None
    collected_this_month: Optional[float] = None
    outstanding_rent: Optional[float] = None
    next_rent_amount: Optional[float] = None
    next_rent_date: Optional[str] = None
    rent_days_until: Optional[int] = None


class EllaChatResponse(BaseModel):
    reply: str
    data_source: str = "database"


class AIChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None
