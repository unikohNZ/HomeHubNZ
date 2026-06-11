from typing import List, Optional

from app.core.config import get_settings
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    MaintenanceCategorizeRequest,
    MaintenanceSuggestRequest,
    MaintenanceSuggestResponse,
    PropertyInsightsResponse,
)

settings = get_settings()

MAINTENANCE_CATEGORIES = {
    "plumbing": ["leak", "tap", "toilet", "pipe", "drain", "water"],
    "electrical": ["light", "power", "outlet", "switch", "fuse", "wiring"],
    "heating": ["heat", "heater", "fireplace", "insulation", "cold"],
    "structural": ["wall", "ceiling", "floor", "door", "window", "roof"],
    "appliance": ["oven", "dishwasher", "washing", "dryer", "fridge"],
    "pest": ["rat", "mouse", "ant", "cockroach", "spider", "wasp"],
    "garden": ["lawn", "fence", "garden", "tree", "hedge"],
    "general": [],
}

FIX_SUGGESTIONS = {
    "plumbing": [
        "Check if the water supply valve is fully open",
        "Place a bucket under the leak to prevent water damage",
        "Contact a licensed plumber for pipe repairs",
    ],
    "electrical": [
        "Check the circuit breaker panel for tripped switches",
        "Test the outlet with another device",
        "Do not attempt DIY electrical repairs — call a licensed electrician",
    ],
    "heating": [
        "Check if the thermostat is set correctly",
        "Ensure vents are not blocked by furniture",
        "Schedule a heat pump service if the unit is over 2 years old",
    ],
    "structural": [
        "Document the damage with photos for your landlord",
        "Check if the issue is getting worse over time",
        "Report to landlord for professional assessment",
    ],
    "general": [
        "Document the issue with photos",
        "Check if it's a simple fix you can handle",
        "Submit a maintenance request through the app",
    ],
}


class AIService:
    """AI service layer with pluggable provider support (OpenAI / Claude)."""

    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or settings.AI_PROVIDER

    async def _call_llm(self, prompt: str, system: str = "") -> str:
        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI

                client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
                messages = []
                if system:
                    messages.append({"role": "system", "content": system})
                messages.append({"role": "user", "content": prompt})
                response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    max_tokens=500,
                )
                return response.choices[0].message.content or ""
            except Exception:
                pass
        return ""

    def _categorize_local(self, text: str) -> str:
        text_lower = text.lower()
        for category, keywords in MAINTENANCE_CATEGORIES.items():
            if any(kw in text_lower for kw in keywords):
                return category
        return "general"

    async def suggest_maintenance_fix(self, data: MaintenanceSuggestRequest) -> MaintenanceSuggestResponse:
        category = self._categorize_local(f"{data.title} {data.description}")

        llm_response = await self._call_llm(
            f"Maintenance issue: {data.title}\nDescription: {data.description}\n"
            "Suggest 3 fixes and estimate cost in NZD. Be concise.",
            system="You are a NZ property maintenance expert.",
        )

        fixes = FIX_SUGGESTIONS.get(category, FIX_SUGGESTIONS["general"])
        if llm_response:
            fixes = [line.strip("- ").strip() for line in llm_response.split("\n") if line.strip()][:3]

        return MaintenanceSuggestResponse(
            category=category,
            suggested_fixes=fixes,
            estimated_cost_nzd="$50 - $500 NZD",
            urgency="medium",
        )

    async def categorize_maintenance(self, data: MaintenanceCategorizeRequest) -> dict:
        category = self._categorize_local(data.description)
        return {"category": category, "confidence": 0.85}

    async def get_property_insights(self, property_id: int) -> PropertyInsightsResponse:
        return PropertyInsightsResponse(
            property_id=property_id,
            maintenance_trends=[
                {"category": "plumbing", "count": 3, "trend": "stable"},
                {"category": "electrical", "count": 1, "trend": "decreasing"},
            ],
            cost_predictions={"next_quarter_nzd": 1200, "annual_nzd": 4500},
            recommendations=[
                "Schedule annual heat pump service",
                "Consider upgrading bathroom fixtures",
                "Review insurance coverage for water damage",
            ],
        )

    async def chat_assistant(self, data: AIChatRequest) -> AIChatResponse:
        llm_response = await self._call_llm(
            data.message,
            system=(
                "You are HomeHub NZ assistant. Help users navigate the property management app. "
                "Answer questions about rent, maintenance, bills, and flatmate management in NZ context."
            ),
        )
        if llm_response:
            return AIChatResponse(reply=llm_response)

        return AIChatResponse(
            reply="I can help you with rent payments, maintenance requests, bills, and more. What would you like to know?",
            suggestions=[
                "How do I submit a maintenance request?",
                "When is my rent due?",
                "How do I split a bill with flatmates?",
            ],
        )
