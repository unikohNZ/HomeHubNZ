import { TenantPayment } from "../../types/tenantPayment";
import { RentPayment } from "../../types/rent";
import { avatarColorFor } from "./chatMapper";

export interface ApiRentPayment {
  id: number;
  lease_id: number;
  amount: number | string;
  due_date: string;
  payment_date?: string | null;
  status: string;
  receipt_url?: string | null;
  notes?: string | null;
  property_id?: number | null;
  property_name?: string | null;
  tenant_id?: number | null;
  tenant_name?: string | null;
  landlord_id?: number | null;
}

function toAmount(value: number | string): number {
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

export function mapApiToRentPayment(p: ApiRentPayment): RentPayment {
  return {
    id: String(p.id),
    property_id: p.property_id != null ? String(p.property_id) : "",
    property_name: p.property_name ?? "Property",
    amount: toAmount(p.amount),
    due_date: p.due_date,
    payment_date: p.payment_date ?? undefined,
    method: p.status === "paid" ? "Bank transfer" : undefined,
  };
}

export function mapApiToTenantPayment(p: ApiRentPayment): TenantPayment {
  const tenantName = p.tenant_name ?? "Tenant";
  return {
    id: `tp-${p.id}`,
    tenant_id: p.tenant_id != null ? String(p.tenant_id) : `t-${p.id}`,
    tenant_name: tenantName,
    tenant_email: "",
    avatar_color: avatarColorFor(tenantName, p.tenant_id ?? p.id),
    property_id: p.property_id != null ? String(p.property_id) : "",
    property_name: p.property_name ?? "Property",
    room_number: "—",
    weekly_rent: toAmount(p.amount),
    due_date: p.due_date,
    payment_date: p.payment_date ?? undefined,
    payment_method: p.status === "paid" ? "Bank transfer" : undefined,
    conversation_id: p.tenant_id != null ? String(p.tenant_id) : undefined,
  };
}
