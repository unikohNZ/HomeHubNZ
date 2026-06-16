export type NotificationCategory =
  | "rent"
  | "bills"
  | "messages"
  | "maintenance"
  | "house_rules"
  | "lease"
  | "join_requests";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  datetime: string;
  read: boolean;
  icon: string;
  badge_color: string;
}

export type FlatmateRole = "Tenant" | "Flatmate" | "Lead Tenant";

export interface FlatmateMember {
  id: string;
  name: string;
  role: FlatmateRole;
  avatar_color: string;
  online: boolean;
  rent_status: "paid" | "pending" | "overdue";
  chore_assignment: string;
  conversation_id?: string;
}

export type RuleCategory = "cleanliness" | "payments" | "guests" | "safety" | "noise";

export interface HouseRule {
  id: string;
  text: string;
  category: RuleCategory;
  accepted: boolean;
}

export type ChoreStatus = "pending" | "completed" | "overdue";
export type ChorePriority = "low" | "medium" | "high";

export interface Chore {
  id: string;
  title: string;
  assigned_to: string;
  assigned_id: string;
  due_date: string;
  status: ChoreStatus;
  priority: ChorePriority;
}

export type BillStatus = "paid" | "pending" | "overdue";
export type BillType = "power" | "internet" | "water" | "gas" | "cleaning";

export interface SharedBill {
  id: string;
  type: BillType;
  label: string;
  total_amount: number;
  due_date: string;
  split_amount: number;
  paid_by: string;
  owes: string[];
  status: BillStatus;
}

export type CalendarEventType =
  | "rent"
  | "inspection"
  | "meeting"
  | "bill"
  | "maintenance"
  | "lease";

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  event_type: CalendarEventType;
  color: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  hours: string;
}

export type MaintenanceStatus =
  | "submitted"
  | "reviewed"
  | "assigned"
  | "in_progress"
  | "completed";

export interface MaintenanceRequest {
  id: string;
  title: string;
  property: string;
  property_id?: string;
  submitted_date: string;
  contractor: string;
  status: MaintenanceStatus;
  expected_completion: string;
  priority: ChorePriority;
  timeline: MaintenanceStatus[];
  conversation_id?: string;
  landlord_note?: string;
}

export type FeedPostType = "bill" | "chore" | "maintenance" | "landlord" | "rule";

export interface FeedPost {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  type: FeedPostType;
  likes: number;
  liked: boolean;
}

export interface AIQuickQuestion {
  id: string;
  question: string;
  answer: string;
}
