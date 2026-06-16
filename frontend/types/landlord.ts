export type TenantRentStatus = "paid" | "pending" | "overdue";

export interface LandlordTenant {
  id: string;
  name: string;
  email: string;
  property_id: string;
  property_name: string;
  rent_status: TenantRentStatus;
  room_assigned: string;
  conversation_id?: string;
}

export interface LandlordDocument {
  id: string;
  title: string;
  category: "lease" | "bond_receipt" | "inspection" | "house_rules" | "other";
  upload_date: string;
  file_name: string;
}

export interface PropertyInspection {
  property_id: string;
  property_name: string;
  next_date: string;
  reminder_enabled: boolean;
}
