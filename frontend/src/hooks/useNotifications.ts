import { useCallback, useEffect, useState } from "react";
import { notificationService } from "../services/notificationService";
import { AppNotification } from "../../types/flat";
import { MOCK_NOTIFICATIONS } from "../../data/mockFlatData";

interface UseNotificationsResult {
  notifications: AppNotification[];
  loading: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      setNotifications(data);
      setIsOffline(false);
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { notifications, loading, isOffline, refresh };
}
