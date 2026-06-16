import { TenantPayment } from "../types/tenantPayment";
import { formatDate, getDaysDifference, parseDate, TODAY } from "./rentDates";
import type {
  TenantPaymentDisplayStatus,
  TenantPaymentFilter,
  WeekView,
} from "../types/tenantPayment";

export function getTenantPaymentStatus(
  dueDate: string,
  paymentDate?: string,
  today: Date = TODAY,
): { status: TenantPaymentDisplayStatus; label: string; daysInfo: string } {
  if (paymentDate) {
    return {
      status: "paid",
      label: "Paid",
      daysInfo: `Paid ${formatDate(parseDate(paymentDate))}`,
    };
  }

  const daysLate = getDaysDifference(today, parseDate(dueDate));

  if (daysLate < 0) {
    const daysUntil = Math.abs(daysLate);
    return {
      status: "upcoming",
      label: "Pending",
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

function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function getWeekRange(view: WeekView, today: Date = TODAY): [Date, Date] {
  const start = getWeekStart(today);
  if (view === "last") start.setDate(start.getDate() - 7);
  if (view === "next") start.setDate(start.getDate() + 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return [start, end];
}

export function isPaymentInWeek(dueDate: string, view: WeekView, today: Date = TODAY): boolean {
  const due = parseDate(dueDate);
  const [start, end] = getWeekRange(view, today);
  return due >= start && due < end;
}

/** One card per tenant per week — latest due date in that week. */
export function getWeeklyTenantPayments(
  payments: TenantPayment[],
  view: WeekView,
): TenantPayment[] {
  const inWeek = payments.filter((p) => isPaymentInWeek(p.due_date, view));
  const byTenant = new Map<string, TenantPayment>();

  for (const p of inWeek) {
    const existing = byTenant.get(p.tenant_id);
    if (!existing || parseDate(p.due_date) >= parseDate(existing.due_date)) {
      byTenant.set(p.tenant_id, p);
    }
  }

  return Array.from(byTenant.values()).sort(
    (a, b) => parseDate(a.due_date).getTime() - parseDate(b.due_date).getTime(),
  );
}

export function matchesPaymentFilter(
  status: TenantPaymentDisplayStatus,
  filter: TenantPaymentFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "paid") return status === "paid";
  if (filter === "due_today") return status === "due_today";
  if (filter === "pending") return status === "pending" || status === "upcoming";
  if (filter === "overdue") return status === "overdue";
  return true;
}

export interface WeeklyPaymentSummary {
  expected: number;
  collected: number;
  outstanding: number;
  overdueCount: number;
}

export function computeWeeklySummary(
  payments: TenantPayment[],
  view: WeekView,
): WeeklyPaymentSummary {
  const weekly = getWeeklyTenantPayments(payments, view);
  let expected = 0;
  let collected = 0;
  let outstanding = 0;
  let overdueCount = 0;

  for (const p of weekly) {
    expected += p.weekly_rent;
    const { status } = getTenantPaymentStatus(p.due_date, p.payment_date);
    if (status === "paid") {
      collected += p.weekly_rent;
    } else {
      outstanding += p.weekly_rent;
      if (status === "overdue") overdueCount += 1;
    }
  }

  return { expected, collected, outstanding, overdueCount };
}

export function getTenantPaymentHistory(
  payments: TenantPayment[],
  tenantId: string,
): TenantPayment[] {
  return payments
    .filter((p) => p.tenant_id === tenantId)
    .sort((a, b) => parseDate(b.due_date).getTime() - parseDate(a.due_date).getTime());
}

export function getTenantPaymentStats(
  payments: TenantPayment[],
  tenantId: string,
): {
  lastFive: TenantPayment[];
  missedCount: number;
  paidThisMonth: number;
  outstandingBalance: number;
} {
  const history = getTenantPaymentHistory(payments, tenantId);
  const lastFive = history.slice(0, 5);
  const today = TODAY;

  let missedCount = 0;
  let paidThisMonth = 0;
  let outstandingBalance = 0;

  for (const p of history) {
    const { status } = getTenantPaymentStatus(p.due_date, p.payment_date, today);
    if (status === "overdue") missedCount += 1;
    if (p.payment_date) {
      const paid = parseDate(p.payment_date);
      if (paid.getMonth() === today.getMonth() && paid.getFullYear() === today.getFullYear()) {
        paidThisMonth += p.weekly_rent;
      }
    }
    if (!p.payment_date && parseDate(p.due_date) <= today) {
      outstandingBalance += p.weekly_rent;
    }
  }

  return { lastFive, missedCount, paidThisMonth, outstandingBalance };
}
