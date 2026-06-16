import { RuleCategory, HouseRule } from "../../types/flat";
import api, { getApiErrorMessage } from "./api";

interface ApiHouseRule {
  id: number;
  property_id: number;
  rule_type: string;
  title: string;
  content: string;
}

const RULE_TYPE_TO_CATEGORY: Record<string, RuleCategory> = {
  cleanliness: "cleanliness",
  payments: "payments",
  guests: "guests",
  safety: "safety",
  noise: "noise",
};

function toHouseRule(rule: ApiHouseRule): HouseRule {
  return {
    id: String(rule.id),
    text: rule.content || rule.title,
    category: RULE_TYPE_TO_CATEGORY[rule.rule_type] ?? "safety",
    accepted: false,
  };
}

export const houseRuleService = {
  async getForProperty(propertyId: number): Promise<HouseRule[]> {
    try {
      const { data } = await api.get<ApiHouseRule[]>(
        `/house-rules/property/${propertyId}`,
      );
      return (data ?? []).map(toHouseRule);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },
};
