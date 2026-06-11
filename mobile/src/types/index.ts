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

export interface Property {
  id: number;
  owner_id: number;
  address_line1: string;
  address_line2?: string;
  suburb: string;
  city: string;
  postcode: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  bond_amount: number;
  rent_frequency: string;
  description?: string;
  image_urls?: string[];
  full_address: string;
}

export interface RentPayment {
  id: number;
  lease_id: number;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: "paid" | "pending" | "overdue";
  receipt_url?: string;
  notes?: string;
}

export interface MaintenanceRequest {
  id: number;
  property_id: number;
  submitted_by: number;
  assigned_to?: number;
  title: string;
  description: string;
  category?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "reviewing" | "assigned" | "in_progress" | "completed";
  image_urls?: string[];
  ai_suggestion?: string;
}

export interface Bill {
  id: number;
  property_id: number;
  bill_type: string;
  provider?: string;
  amount: number;
  due_date: string;
  status: string;
  description?: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  body: string;
  data?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  name?: string;
  room_type: string;
  property_id?: number;
  last_message?: Message;
  unread_count: number;
}

export interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  event_type: string;
  color: string;
}

export interface DashboardStats {
  upcomingRent?: RentPayment;
  outstandingBills?: number;
  maintenanceCount?: number;
  unreadMessages?: number;
  monthlyIncome?: number;
  outstandingRent?: number;
  activeProperties?: number;
  occupancyRate?: number;
  inspectionsDue?: number;
}
