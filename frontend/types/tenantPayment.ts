export type TenantPaymentDisplayStatus =
  | "paid"
  | "due_today"
  | "pending"
  | "overdue"
  | "upcoming";

export type TenantPaymentFilter =
  | "all"
  | "paid"
  | "due_today"
  | "pending"
  | "overdue";

export type WeekView = "this" | "last" | "next";

export interface TenantPayment {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_email: string;
  avatar_color: string;
  property_id: string;
  property_name: string;
  room_number: string;
  weekly_rent: number;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  conversation_id?: string;
}
