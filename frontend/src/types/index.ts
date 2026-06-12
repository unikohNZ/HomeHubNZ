/**
 * Domain types for HomeHub NZ.
 * Aligned with the FastAPI backend schemas so the mock layer can be
 * swapped for live API calls without changing screen code.
 */

export type UserRole =
  | "tenant"
  | "flatmate"
  | "landlord"
  | "property_manager"
  | "contractor"
  | "admin";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  role: UserRole;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export type RentFrequency = "week" | "fortnight" | "month";

export type PropertyType = "apartment" | "townhouse" | "house" | "unit" | "studio";

export type InspectionStatus = "passed" | "due" | "scheduled" | "overdue";

export interface Property {
  id: number;
  owner_id: number;
  name: string;
  address_line1: string;
  address_line2?: string;
  suburb: string;
  city: string;
  postcode: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  bond_amount: number;
  rent_frequency: RentFrequency;
  tenant_count: number;
  inspection_status: InspectionStatus;
  next_inspection?: string;
  lease_start?: string;
  lease_end?: string;
  description?: string;
  image_url: string;
  full_address: string;
}

export type RentStatus = "paid" | "pending" | "overdue";

export interface RentPayment {
  id: number;
  property_id: number;
  property_name: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: RentStatus;
  method?: string;
  receipt_url?: string;
  notes?: string;
}

export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export type MaintenanceStatus =
  | "submitted"
  | "reviewing"
  | "assigned"
  | "in_progress"
  | "completed";

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  property_name: string;
  submitted_by: string;
  assigned_to?: string;
  title: string;
  description: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  created_at: string;
  image_urls?: string[];
  ai_suggestion?: string;
}

export type NotificationType =
  | "rent_reminder"
  | "maintenance_update"
  | "inspection"
  | "payment_received"
  | "message";

export interface AppNotification {
  id: number;
  notification_type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  created_at: string;
  is_mine: boolean;
}

export interface ChatRoom {
  id: number;
  name: string;
  role: string;
  avatar_color: string;
  property_name?: string;
  last_message: string;
  last_time: string;
  unread_count: number;
  online: boolean;
}

export interface ActivityItem {
  id: number;
  type: "rent" | "maintenance" | "message" | "inspection" | "property";
  title: string;
  subtitle: string;
  time: string;
}

export interface DashboardStats {
  rent_due: number;
  rent_due_label: string;
  active_properties: number;
  open_maintenance: number;
  unread_messages: number;
  monthly_income: number;
  occupancy_rate: number;
}
