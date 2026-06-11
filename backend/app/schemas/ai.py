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


class AIChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = None
