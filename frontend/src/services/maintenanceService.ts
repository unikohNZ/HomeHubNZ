import { MaintenanceRequest } from "../../types/flat";
import { MOCK_MAINTENANCE } from "../../data/mockFlatData";
import { DataResult, isMockMode, resolveOfflineData } from "../utils/dataSource";
import api, { getApiErrorMessage } from "./api";

export type NewMaintenanceInput = {
  property_id: number;
  title: string;
  description: string;
  category?: string;
  priority?: string;
};

export const maintenanceService = {
  async list(propertyId: number, cached?: MaintenanceRequest[]): Promise<DataResult<MaintenanceRequest[]>> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 300));
      return { data: MOCK_MAINTENANCE, source: "mock" };
    }
    try {
      const { data } = await api.get<MaintenanceRequest[]>("/maintenance", {
        params: { property_id: propertyId },
      });
      return { data: data ?? [], source: "api" };
    } catch (error) {
      return resolveOfflineData(cached, MOCK_MAINTENANCE, getApiErrorMessage(error));
    }
  },

  async create(input: NewMaintenanceInput): Promise<MaintenanceRequest> {
    if (isMockMode()) {
      return {
        id: String(Date.now()),
        property_id: String(input.property_id),
        title: input.title,
        description: input.description,
        category: input.category as MaintenanceRequest["category"],
        priority: input.priority as MaintenanceRequest["priority"],
        status: "submitted",
        submitted_by: "You",
        created_at: new Date().toISOString(),
      };
    }
    const { data } = await api.post<MaintenanceRequest>("/maintenance", input);
    return data;
  },
};
