from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import HouseRuleType


class HouseRuleCreate(BaseModel):
    property_id: int
    rule_type: HouseRuleType
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)


class HouseRuleResponse(BaseModel):
    id: int
    property_id: int
    created_by: int
    rule_type: HouseRuleType
    title: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HouseRuleAcceptResponse(BaseModel):
    id: int
    rule_id: int
    user_id: int
    accepted_at: datetime

    model_config = {"from_attributes": True}
