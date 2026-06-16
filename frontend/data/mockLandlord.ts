import { AppNotification } from "../types/flat";
import { LandlordDocument, LandlordTenant } from "../types/landlord";

export const MOCK_LANDLORD_TENANTS: LandlordTenant[] = [
  {
    id: "t1",
    name: "Unikoh Gwapo",
    email: "unikoh@example.co.nz",
    property_id: "1",
    property_name: "Mount Maunganui Apartment",
    rent_status: "pending",
    room_assigned: "Bedroom 1",
    conversation_id: "c1",
  },
  {
    id: "t2",
    name: "Sarah Lee",
    email: "sarah@example.co.nz",
    property_id: "1",
    property_name: "Mount Maunganui Apartment",
    rent_status: "paid",
    room_assigned: "Bedroom 2",
    conversation_id: "c2",
  },
];

export const MOCK_LANDLORD_DOCUMENTS: LandlordDocument[] = [
  {
    id: "ld1",
    title: "Lease Agreement",
    category: "lease",
    upload_date: "1 Sep 2025",
    file_name: "Lease Agreement 2025-2026.pdf",
  },
  {
    id: "ld2",
    title: "Bond Receipt",
    category: "bond_receipt",
    upload_date: "28 Aug 2025",
    file_name: "Bond Receipt BN123456.pdf",
  },
  {
    id: "ld3",
    title: "Inspection Report",
    category: "inspection",
    upload_date: "15 Mar 2026",
    file_name: "Q1 Inspection Report.pdf",
  },
  {
    id: "ld4",
    title: "House Rules",
    category: "house_rules",
    upload_date: "2 Sep 2025",
    file_name: "House Rules Signed.pdf",
  },
];

export const MOCK_LANDLORD_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ln1",
    category: "join_requests",
    title: "New join request",
    message: "James Patel requested to join Tauranga Townhouse.",
    datetime: "13 Jun 2026, 9:15 AM",
    read: false,
    icon: "👋",
    badge_color: "#4F8CFF",
  },
  {
    id: "ln2",
    category: "rent",
    title: "Rent overdue",
    message: "Unikoh Gwapo — $360 overdue for Mount Maunganui Apartment.",
    datetime: "12 Jun 2026, 8:00 AM",
    read: false,
    icon: "💰",
    badge_color: "#f59e0b",
  },
  {
    id: "ln3",
    category: "maintenance",
    title: "Maintenance request updated",
    message: "Heat pump repair moved to In Progress — Bay Heating Ltd assigned.",
    datetime: "11 Jun 2026, 4:15 PM",
    read: false,
    icon: "🔧",
    badge_color: "#a855f7",
  },
  {
    id: "ln4",
    category: "lease",
    title: "Inspection reminder",
    message: "Quarterly inspection scheduled for 20 June 2026 at 10:00 AM.",
    datetime: "8 Jun 2026, 3:00 PM",
    read: true,
    icon: "📋",
    badge_color: "#6366f1",
  },
];

export const DEFAULT_INSPECTION_DATE = "20 June 2026";
