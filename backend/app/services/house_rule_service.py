from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.house_rule import HouseRule, HouseRuleAcceptance
from app.models.property import Property
from app.models.user import User
from app.schemas.house_rule import HouseRuleAcceptResponse, HouseRuleCreate, HouseRuleResponse


class HouseRuleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: HouseRuleCreate, user: User) -> HouseRuleResponse:
        prop = await self.db.get(Property, data.property_id)
        if not prop or prop.owner_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

        rule = HouseRule(
            property_id=data.property_id,
            created_by=user.id,
            rule_type=data.rule_type,
            title=data.title,
            content=data.content,
        )
        self.db.add(rule)
        await self.db.flush()
        return HouseRuleResponse.model_validate(rule)

    async def list_for_property(self, property_id: int) -> list[HouseRuleResponse]:
        result = await self.db.execute(
            select(HouseRule).where(HouseRule.property_id == property_id).order_by(HouseRule.created_at.desc())
        )
        return [HouseRuleResponse.model_validate(r) for r in result.scalars().all()]

    async def accept(self, rule_id: int, user: User) -> HouseRuleAcceptResponse:
        rule = await self.db.get(HouseRule, rule_id)
        if not rule:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")

        acceptance = HouseRuleAcceptance(
            rule_id=rule_id,
            user_id=user.id,
            accepted_at=datetime.now(timezone.utc),
        )
        self.db.add(acceptance)
        await self.db.flush()
        return HouseRuleAcceptResponse.model_validate(acceptance)
