import { ComputedRentStatus } from "../utils/rentDates";

export interface RentPayment {
  id: string;
  property_id: string;
  property_name: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  method?: string;
}

export interface ComputedRentPayment extends RentPayment {
  computed_status: ComputedRentStatus;
  status_label: string;
  days_info: string;
  due_date_display: string;
  payment_date_display?: string;
}

export interface RentSections {
  current_due: ComputedRentPayment[];
  upcoming: ComputedRentPayment[];
  overdue: ComputedRentPayment[];
  history: ComputedRentPayment[];
  current_due_total: number;
  upcoming_total: number;
  overdue_total: number;
  paid_this_month: number;
}
