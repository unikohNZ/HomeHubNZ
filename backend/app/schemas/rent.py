from datetime import date
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.enums import RentStatus


class RentPaymentCreate(BaseModel):
    lease_id: int
    amount: Decimal = Field(gt=0)
    due_date: date
    notes: Optional[str] = None


class RentPaymentSubmit(BaseModel):
    payment_date: date
    receipt_url: Optional[str] = None
    notes: Optional[str] = None


class RentPaymentResponse(BaseModel):
    id: int
    lease_id: int
    amount: Decimal
    due_date: date
    payment_date: Optional[date] = None
    status: RentStatus
    receipt_url: Optional[str] = None
    notes: Optional[str] = None

    model_config = {"from_attributes": True}


class RentAnalytics(BaseModel):
    total_collected: Decimal
    total_outstanding: Decimal
    overdue_count: int
    paid_count: int
    pending_count: int
    monthly_income: List[dict]
    collection_rate: float
