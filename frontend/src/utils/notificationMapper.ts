import { AppNotification, NotificationCategory } from "../../types/flat";

export interface ApiNotification {
  id: number;
  notification_type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, { icon: string; color: string; category: NotificationCategory }> = {
  rent_due: { icon: "💰", color: "#f59e0b", category: "rent" },
  rent_overdue: { icon: "⚠️", color: "#ef4444", category: "rent" },
  maintenance_assigned: { icon: "🔧", color: "#3b82f6", category: "maintenance" },
  join_request_approved: { icon: "✅", color: "#22c55e", category: "join_requests" },
  message_received: { icon: "💬", color: "#4F8CFF", category: "messages" },
  house_rule: { icon: "📋", color: "#a855f7", category: "house_rules" },
};

export function mapApiNotification(n: ApiNotification): AppNotification {
  const meta = TYPE_ICONS[n.notification_type] ?? {
    icon: "🔔",
    color: "#64748b",
    category: "messages" as NotificationCategory,
  };
  return {
    id: String(n.id),
    category: meta.category,
    title: n.title,
    message: n.body,
    datetime: n.created_at,
    read: n.is_read,
    icon: meta.icon,
    badge_color: meta.color,
  };
}
