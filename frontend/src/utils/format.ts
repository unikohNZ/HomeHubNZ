import {
  MaintenancePriority,
  MaintenanceStatus,
  RentStatus,
} from "@/types";
import { colors } from "@/constants/theme";

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-NZ")}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diff)) return dateStr;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(first: string, last?: string): string {
  return `${first.charAt(0)}${last?.charAt(0) ?? ""}`.toUpperCase();
}

type Tone = { bg: string; text: string };

export function rentStatusTone(status: RentStatus): Tone {
  switch (status) {
    case "paid":
      return { bg: colors.successMuted, text: colors.successText };
    case "overdue":
      return { bg: colors.dangerMuted, text: colors.dangerText };
    default:
      return { bg: colors.warningMuted, text: colors.warningText };
  }
}

export function maintenanceStatusTone(status: MaintenanceStatus): Tone {
  switch (status) {
    case "completed":
      return { bg: colors.successMuted, text: colors.successText };
    case "in_progress":
    case "assigned":
      return { bg: colors.primaryMuted, text: colors.primary };
    case "reviewing":
      return { bg: colors.warningMuted, text: colors.warningText };
    default:
      return { bg: "rgba(148, 163, 184, 0.16)", text: colors.textSecondary };
  }
}

export function priorityTone(priority: MaintenancePriority): Tone {
  switch (priority) {
    case "urgent":
      return { bg: colors.dangerMuted, text: colors.dangerText };
    case "high":
      return { bg: colors.warningMuted, text: colors.warningText };
    case "medium":
      return { bg: colors.primaryMuted, text: colors.primary };
    default:
      return { bg: colors.successMuted, text: colors.successText };
  }
}

export function inspectionTone(status: string): Tone {
  switch (status) {
    case "passed":
      return { bg: colors.successMuted, text: colors.successText };
    case "overdue":
      return { bg: colors.dangerMuted, text: colors.dangerText };
    case "scheduled":
      return { bg: colors.primaryMuted, text: colors.primary };
    default:
      return { bg: colors.warningMuted, text: colors.warningText };
  }
}
