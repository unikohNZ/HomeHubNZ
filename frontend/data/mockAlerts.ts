export type AlertCategory = "emergency" | "rent" | "maintenance" | "community";
export type AlertPriority = "low" | "medium" | "high" | "critical";

export interface AppAlert {
  id: string;
  title: string;
  message: string;
  category: AlertCategory;
  priority: AlertPriority;
  time: string;
  action_label?: string;
}

export type EmergencyStatus = "normal" | "watch" | "emergency";

export const CURRENT_EMERGENCY_STATUS: EmergencyStatus = "normal";

export const MOCK_ALERTS: AppAlert[] = [
  {
    id: "a1",
    title: "Earthquake Alert",
    message: "M5.2 earthquake reported near East Cape. Check for damage and follow Civil Defence advice.",
    category: "emergency",
    priority: "critical",
    time: "2 hours ago",
    action_label: "View Guide",
  },
  {
    id: "a2",
    title: "Flood Warning",
    message: "Heavy rain expected in Bay of Plenty. Avoid low-lying areas near waterways.",
    category: "emergency",
    priority: "high",
    time: "5 hours ago",
    action_label: "Flood Guide",
  },
  {
    id: "a3",
    title: "Storm Warning",
    message: "Strong winds forecast for Tauranga tonight. Secure outdoor items.",
    category: "emergency",
    priority: "medium",
    time: "Yesterday",
    action_label: "Storm Guide",
  },
  {
    id: "a4",
    title: "Rent Reminder",
    message: "Your rent share of $360 is due tomorrow for Mount Maunganui Apartment.",
    category: "rent",
    priority: "medium",
    time: "Today, 9:00 AM",
    action_label: "Pay Rent",
  },
  {
    id: "a5",
    title: "Inspection Reminder",
    message: "Quarterly property inspection on 20 June at 10:00 AM.",
    category: "maintenance",
    priority: "low",
    time: "12 Jun 2026",
    action_label: "View Calendar",
  },
  {
    id: "a6",
    title: "Flat Meeting Tonight",
    message: "House meeting at 7 PM to discuss chore rotation and visitor policy.",
    category: "community",
    priority: "low",
    time: "Today, 3:00 PM",
    action_label: "RSVP",
  },
];

export const MOCK_UPCOMING_EVENTS = [
  { id: "e1", title: "Rent Due", date: "13 June 2026", icon: "💰", tone: "warning" as const },
  { id: "e2", title: "Inspection", date: "20 June 2026", icon: "🔍", tone: "primary" as const },
  { id: "e3", title: "Flat Meeting", date: "14 June 2026", icon: "👥", tone: "accent" as const },
  { id: "e4", title: "Heat Pump Service", date: "22 June 2026", icon: "🔧", tone: "muted" as const },
];
