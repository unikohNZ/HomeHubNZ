import { AppNotification } from "../../types/flat";
import { MOCK_NOTIFICATIONS } from "../../data/mockFlatData";
import { mapApiNotification, ApiNotification } from "../utils/notificationMapper";
import { DataResult, isMockMode, resolveOfflineData } from "../utils/dataSource";
import api, { getApiErrorMessage } from "./api";

export const notificationService = {
  async list(cached?: AppNotification[]): Promise<DataResult<AppNotification[]>> {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 200));
      return { data: MOCK_NOTIFICATIONS, source: "mock" };
    }
    try {
      const { data } = await api.get<ApiNotification[]>("/notifications");
      return {
        data: (data ?? []).map(mapApiNotification),
        source: "api",
      };
    } catch (error) {
      return resolveOfflineData(cached, MOCK_NOTIFICATIONS, getApiErrorMessage(error));
    }
  },

  async markRead(id: string): Promise<void> {
    if (isMockMode()) return;
    await api.put(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    if (isMockMode()) return;
    await api.put("/notifications/read-all");
  },
};
