from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.house_rule import HouseRuleAcceptResponse, HouseRuleCreate, HouseRuleResponse
from app.services.house_rule_service import HouseRuleService

router = APIRouter()


@router.post("", response_model=HouseRuleResponse, status_code=201)
async def create_house_rule(
    data: HouseRuleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = HouseRuleService(db)
    return await service.create(data, current_user)


@router.get("/property/{property_id}", response_model=List[HouseRuleResponse])
async def list_house_rules(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = HouseRuleService(db)
    return await service.list_for_property(property_id)


@router.post("/{rule_id}/accept", response_model=HouseRuleAcceptResponse)
async def accept_house_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = HouseRuleService(db)
    return await service.accept(rule_id, current_user)
