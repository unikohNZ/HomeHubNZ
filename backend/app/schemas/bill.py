from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import BillStatus, BillType


class BillCreate(BaseModel):
    property_id: int
    bill_type: BillType
    amount: Decimal = Field(gt=0)
    due_date: date
    provider: Optional[str] = None
    description: Optional[str] = None


class BillSplitRequest(BaseModel):
    splits: List[dict]  # [{"user_id": 1, "share_percent": 50}]


class BillResponse(BaseModel):
    id: int
    property_id: int
    bill_type: BillType
    provider: Optional[str] = None
    amount: Decimal
    due_date: date
    status: BillStatus
    description: Optional[str] = None

    model_config = {"from_attributes": True}
