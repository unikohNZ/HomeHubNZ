export type DocumentCategory =
  | "lease"
  | "house_rules"
  | "bond_receipt"
  | "inspection"
  | "insurance"
  | "utility";

export interface FlatDocument {
  id: string;
  file_name: string;
  upload_date: string;
  uploaded_by: string;
  category: DocumentCategory;
  status: "active" | "archived";
}

export type BondRefundStatus = "requested" | "approved" | "refunded" | "none";

export interface BondTracker {
  total_bond: number;
  my_share: number;
  status: "paid" | "pending";
  bond_number: string;
  refund_status: BondRefundStatus;
  timeline: { label: string; done: boolean; pending?: boolean }[];
  progress: number;
}

export type ChecklistPhase = "move_in" | "move_out";

export interface ChecklistItem {
  id: string;
  phase: ChecklistPhase;
  label: string;
  completed: boolean;
}

export type ExpenseStatus = "paid" | "pending" | "overdue";

export interface MonthlyExpense {
  id: string;
  label: string;
  amount: number;
  status: ExpenseStatus;
}

export type AvailabilityStatus = "home" | "away" | "working" | "vacation";

export interface FlatmateAvailability {
  id: string;
  name: string;
  status: AvailabilityStatus;
  note: string;
  avatar_color: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  purchased: boolean;
  purchaser?: string;
}

export interface VisitorEntry {
  id: string;
  visitor_name: string;
  host: string;
  date: string;
  overnight: boolean;
  approved: boolean;
  upcoming: boolean;
}

export interface UtilityUsage {
  type: "power" | "internet" | "water" | "gas";
  label: string;
  months: { month: string; amount: number }[];
  trend_percent: number;
}

export interface LeaseMilestone {
  id: string;
  label: string;
  date: string;
  done: boolean;
}

export interface LeaseTimeline {
  move_in: string;
  inspection: string;
  renewal: string;
  lease_end: string;
  days_remaining: number;
  milestones: LeaseMilestone[];
}

export interface VibeCategory {
  id: string;
  label: string;
  rating: number;
}

export interface HouseVibe {
  categories: VibeCategory[];
  overall: number;
}

export interface MaintenanceHistoryItem {
  id: string;
  title: string;
  date: string;
  cost: number;
  contractor: string;
  notes: string;
}

export interface GalleryImage {
  id: string;
  label: string;
  uri: string;
}

export interface AgreementSection {
  id: string;
  title: string;
  rules: string[];
}

export interface AgreementAcceptance {
  name: string;
  accepted: boolean;
  date?: string;
}

export interface FlatAgreement {
  sections: AgreementSection[];
  acceptances: AgreementAcceptance[];
  user_accepted: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  pinned: boolean;
  read: boolean;
}

export interface PropertyHealthMetric {
  id: string;
  label: string;
  score: number;
}

export interface PropertyHealth {
  metrics: PropertyHealthMetric[];
  overall: number;
}
