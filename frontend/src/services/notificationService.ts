import api from "./api";
import { AppNotification } from "../../types/flat";
import { MOCK_NOTIFICATIONS } from "../../data/mockFlatData";

const USE_MOCK = true;
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    if (USE_MOCK) {
      await delay();
      return MOCK_NOTIFICATIONS;
    }
    try {
      const { data } = await api.get<AppNotification[]>("/notifications");
      return data?.length ? data : MOCK_NOTIFICATIONS;
    } catch {
      return MOCK_NOTIFICATIONS;
    }
  },

  async markRead(id: string): Promise<void> {
    if (USE_MOCK) {
      await delay(150);
      return;
    }
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {
      // offline — no-op for now
    }
  },

  async markAllRead(): Promise<void> {
    if (USE_MOCK) {
      await delay(150);
      return;
    }
    try {
      await api.post("/notifications/read-all");
    } catch {
      // offline — no-op for now
    }
  },
};
