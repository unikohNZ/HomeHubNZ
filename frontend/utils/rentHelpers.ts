import { ComputedRentPayment, RentPayment, RentSections } from "../types/rent";
import { formatDate, getDaysDifference, getRentStatus, parseDate, TODAY } from "./rentDates";

export function computeRentPayment(payment: RentPayment): ComputedRentPayment {
  const result = getRentStatus(payment.due_date, payment.payment_date, TODAY);
  return {
    ...payment,
    computed_status: result.status,
    status_label: result.label,
    days_info: result.daysInfo,
    due_date_display: formatDate(parseDate(payment.due_date)),
    payment_date_display: payment.payment_date
      ? formatDate(parseDate(payment.payment_date))
      : undefined,
  };
}

export function buildRentSections(payments: RentPayment[]): RentSections {
  const computed = payments.map(computeRentPayment);

  const current_due = computed.filter(
    (p) => p.computed_status === "due_today" || p.computed_status === "pending",
  );
  const upcoming = computed.filter((p) => p.computed_status === "upcoming");
  const overdue = computed.filter((p) => p.computed_status === "overdue");
  const history = computed.filter((p) => p.computed_status === "paid");

  const sum = (items: ComputedRentPayment[]) =>
    items.reduce((s, p) => s + p.amount, 0);

  const paid_this_month = history
    .filter((p) => {
      if (!p.payment_date) return false;
      const paid = parseDate(p.payment_date);
      return paid.getMonth() === TODAY.getMonth() && paid.getFullYear() === TODAY.getFullYear();
    })
    .reduce((s, p) => s + p.amount, 0);

  return {
    current_due,
    upcoming,
    overdue,
    history,
    current_due_total: sum(current_due),
    upcoming_total: sum(upcoming),
    overdue_total: sum(overdue),
    paid_this_month,
  };
}

export function getNextRentDate(payments: RentPayment[]): string | null {
  const unpaid = payments
    .filter((p) => !p.payment_date)
    .map((p) => ({ payment: p, due: parseDate(p.due_date) }))
    .filter(({ due }) => due >= TODAY)
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  if (unpaid.length === 0) return null;
  return formatDate(unpaid[0].due);
}

/** Negative values mean overdue. */
export function getRentDaysUntil(payments: RentPayment[]): number | null {
  const unpaid = payments
    .filter((p) => !p.payment_date)
    .map((p) => parseDate(p.due_date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (unpaid.length === 0) return null;
  return -getDaysDifference(TODAY, unpaid[0]);
}
