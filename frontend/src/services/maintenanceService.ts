import api from "./api";
import { MaintenanceRequest } from "@/types";
import { MOCK_MAINTENANCE } from "@/data/mockData";

const USE_MOCK = true;
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export type NewMaintenanceInput = Omit<
  MaintenanceRequest,
  "id" | "created_at" | "status"
>;

export const maintenanceService = {
  async list(): Promise<MaintenanceRequest[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_MAINTENANCE;
    }
    const { data } = await api.get("/maintenance");
    return data;
  },

  async get(id: number): Promise<MaintenanceRequest | undefined> {
    if (USE_MOCK) {
      await delay(200);
      return MOCK_MAINTENANCE.find((m) => m.id === id);
    }
    const { data } = await api.get(`/maintenance/${id}`);
    return data;
  },

  async create(input: NewMaintenanceInput): Promise<MaintenanceRequest> {
    if (USE_MOCK) {
      await delay();
      return {
        ...input,
        id: Date.now(),
        status: "submitted",
        created_at: new Date().toISOString(),
      };
    }
    const { data } = await api.post("/maintenance", input);
    return data;
  },
};
