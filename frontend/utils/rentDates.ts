export const TODAY = new Date(2026, 5, 13);

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export function parseDate(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const parts = dateStr.trim().split(" ");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = MONTHS[parts[1]] ?? 0;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDaysDifference(dateA: Date, dateB: Date): number {
  const msPerDay = 86400000;
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

export type ComputedRentStatus =
  | "paid"
  | "upcoming"
  | "due_today"
  | "pending"
  | "overdue";

export interface RentStatusResult {
  status: ComputedRentStatus;
  label: string;
  daysInfo: string;
}

export function getRentStatus(
  dueDate: string,
  paymentDate?: string,
  today: Date = TODAY,
): RentStatusResult {
  if (paymentDate) {
    return {
      status: "paid",
      label: "Paid",
      daysInfo: `Paid ${formatDate(parseDate(paymentDate))}`,
    };
  }

  const due = parseDate(dueDate);
  const daysLate = getDaysDifference(today, due);

  if (daysLate < 0) {
    const daysUntil = Math.abs(daysLate);
    return {
      status: "upcoming",
      label: "Upcoming",
      daysInfo: `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
    };
  }

  if (daysLate === 0) {
    return { status: "due_today", label: "Due Today", daysInfo: "Due today" };
  }

  if (daysLate === 1) {
    return { status: "pending", label: "Pending", daysInfo: "1 day late" };
  }

  return {
    status: "overdue",
    label: "Overdue",
    daysInfo: `${daysLate} days overdue`,
  };
}
