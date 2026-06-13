import {
  Announcement,
  BondTracker,
  ChecklistItem,
  FlatAgreement,
  FlatDocument,
  FlatmateAvailability,
  GalleryImage,
  HouseVibe,
  LeaseTimeline,
  MaintenanceHistoryItem,
  MonthlyExpense,
  PropertyHealth,
  ShoppingItem,
  UtilityUsage,
  VisitorEntry,
} from "../types/flatExtended";

export const MOCK_DOCUMENTS: FlatDocument[] = [
  { id: "d1", file_name: "Lease Agreement 2025-2026.pdf", upload_date: "1 Sep 2025", uploaded_by: "Aroha Ngata", category: "lease", status: "active" },
  { id: "d2", file_name: "House Rules Signed.pdf", upload_date: "2 Sep 2025", uploaded_by: "Aroha Ngata", category: "house_rules", status: "active" },
  { id: "d3", file_name: "Bond Receipt BN123456.pdf", upload_date: "28 Aug 2025", uploaded_by: "Tenancy Services", category: "bond_receipt", status: "active" },
  { id: "d4", file_name: "Q1 Inspection Report.pdf", upload_date: "15 Mar 2026", uploaded_by: "Bay Property Management", category: "inspection", status: "active" },
  { id: "d5", file_name: "Contents Insurance Policy.pdf", upload_date: "10 Sep 2025", uploaded_by: "Sarah Lee", category: "insurance", status: "active" },
  { id: "d6", file_name: "Spark Fibre Agreement.pdf", upload_date: "5 Sep 2025", uploaded_by: "Unikoh Gwapo", category: "utility", status: "active" },
];

export const MOCK_BOND: BondTracker = {
  total_bond: 2880,
  my_share: 1440,
  status: "paid",
  bond_number: "BN123456",
  refund_status: "none",
  timeline: [
    { label: "Bond Paid", done: true },
    { label: "Bond Submitted", done: true },
    { label: "Bond Held", done: true },
    { label: "Bond Refund Pending", done: false, pending: true },
  ],
  progress: 75,
};

export const MOCK_CHECKLIST: ChecklistItem[] = [
  { id: "ci1", phase: "move_in", label: "Bond Paid", completed: true },
  { id: "ci2", phase: "move_in", label: "Lease Signed", completed: true },
  { id: "ci3", phase: "move_in", label: "Received Keys", completed: true },
  { id: "ci4", phase: "move_in", label: "Internet Setup", completed: true },
  { id: "ci5", phase: "move_in", label: "Utility Registration", completed: false },
  { id: "ci6", phase: "move_in", label: "Emergency Contacts Added", completed: false },
  { id: "co1", phase: "move_out", label: "Clean Room", completed: false },
  { id: "co2", phase: "move_out", label: "Return Keys", completed: false },
  { id: "co3", phase: "move_out", label: "Final Inspection", completed: false },
  { id: "co4", phase: "move_out", label: "Bond Refund Request", completed: false },
];

export const MOCK_EXPENSES: MonthlyExpense[] = [
  { id: "ex1", label: "Rent", amount: 360, status: "pending" },
  { id: "ex2", label: "Power", amount: 42, status: "pending" },
  { id: "ex3", label: "Internet", amount: 18, status: "paid" },
  { id: "ex4", label: "Water", amount: 12, status: "paid" },
  { id: "ex5", label: "Cleaning", amount: 10, status: "paid" },
];

export const MOCK_AVAILABILITY: FlatmateAvailability[] = [
  { id: "av1", name: "Sarah Lee", status: "away", note: "Away until Sunday", avatar_color: "#22c55e" },
  { id: "av2", name: "James Patel", status: "working", note: "Working nights", avatar_color: "#a855f7" },
  { id: "av3", name: "Unikoh Gwapo", status: "home", note: "Available", avatar_color: "#3b82f6" },
];

export const MOCK_SHOPPING: ShoppingItem[] = [
  { id: "s1", name: "Toilet Paper", purchased: false },
  { id: "s2", name: "Dishwashing Liquid", purchased: false },
  { id: "s3", name: "Milk", purchased: true, purchaser: "Sarah Lee" },
  { id: "s4", name: "Garbage Bags", purchased: false },
];

export const MOCK_VISITORS: VisitorEntry[] = [
  { id: "v1", visitor_name: "Mia Chen", host: "Sarah Lee", date: "15 Jun 2026", overnight: true, approved: true, upcoming: true },
  { id: "v2", visitor_name: "Tom Wilson", host: "James Patel", date: "8 Jun 2026", overnight: false, approved: true, upcoming: false },
  { id: "v3", visitor_name: "Alex Rivera", host: "Unikoh Gwapo", date: "20 Jun 2026", overnight: true, approved: false, upcoming: true },
];

export const MOCK_UTILITIES: UtilityUsage[] = [
  { type: "power", label: "Power", months: [{ month: "May", amount: 120 }, { month: "Jun", amount: 145 }], trend_percent: 20 },
  { type: "internet", label: "Internet", months: [{ month: "May", amount: 85 }, { month: "Jun", amount: 85 }], trend_percent: 0 },
  { type: "water", label: "Water", months: [{ month: "May", amount: 68 }, { month: "Jun", amount: 72 }], trend_percent: 6 },
  { type: "gas", label: "Gas", months: [{ month: "May", amount: 88 }, { month: "Jun", amount: 96 }], trend_percent: 9 },
];

export const MOCK_LEASE_TIMELINE: LeaseTimeline = {
  move_in: "1 September 2025",
  inspection: "20 June 2026",
  renewal: "1 July 2026",
  lease_end: "1 September 2026",
  days_remaining: 254,
  milestones: [
    { id: "lm1", label: "Move In", date: "1 Sep 2025", done: true },
    { id: "lm2", label: "Inspection", date: "20 Jun 2026", done: false },
    { id: "lm3", label: "Renewal Discussion", date: "1 Jul 2026", done: false },
    { id: "lm4", label: "Lease End", date: "1 Sep 2026", done: false },
  ],
};

export const MOCK_HOUSE_VIBE: HouseVibe = {
  categories: [
    { id: "v1", label: "Cleanliness", rating: 5 },
    { id: "v2", label: "Quietness", rating: 4 },
    { id: "v3", label: "Social", rating: 4 },
    { id: "v4", label: "Work Friendly", rating: 5 },
    { id: "v5", label: "Guest Friendly", rating: 4 },
  ],
  overall: 4.6,
};

export const MOCK_MAINTENANCE_HISTORY: MaintenanceHistoryItem[] = [
  { id: "mh1", title: "Heat Pump Repair", date: "May 2026", cost: 280, contractor: "Bay Heating Ltd", notes: "Replaced filter and serviced unit" },
  { id: "mh2", title: "Kitchen Tap Leak", date: "Mar 2026", cost: 95, contractor: "FlowRight Plumbing", notes: "Washer replaced" },
  { id: "mh3", title: "Smoke Alarm Replacement", date: "Jan 2026", cost: 45, contractor: "Sparky Solutions", notes: "All alarms tested and compliant" },
];

export const MOCK_GALLERY: GalleryImage[] = [
  { id: "g1", label: "Living Room", uri: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
  { id: "g2", label: "Kitchen", uri: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=800&q=80" },
  { id: "g3", label: "Bedroom", uri: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80" },
  { id: "g4", label: "Bathroom", uri: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80" },
  { id: "g5", label: "Garage", uri: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" },
  { id: "g6", label: "Laundry", uri: "https://images.unsplash.com/photo-1620626011761-996a0a7a8d8e?auto=format&fit=crop&w=800&q=80" },
  { id: "g7", label: "Outdoor Area", uri: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80" },
];

export const MOCK_AGREEMENT: FlatAgreement = {
  sections: [
    { id: "ag1", title: "Rent Rules", rules: ["Pay rent every Friday", "Notify landlord if payment will be late"] },
    { id: "ag2", title: "Chore Rules", rules: ["Complete assigned weekly chores", "Request swap 24h in advance"] },
    { id: "ag3", title: "Guest Rules", rules: ["Max 2 nights unless approved", "Register visitors in app"] },
    { id: "ag4", title: "Noise Rules", rules: ["Quiet hours after 10 PM", "No loud music on weekdays"] },
    { id: "ag5", title: "Property Care", rules: ["Report damage immediately", "Keep shared areas clean"] },
  ],
  acceptances: [
    { name: "Sarah Lee", accepted: true, date: "2 Sep 2025" },
    { name: "James Patel", accepted: true, date: "3 Sep 2025" },
    { name: "Unikoh Gwapo", accepted: true, date: "1 Sep 2025" },
  ],
  user_accepted: true,
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: "an1", title: "Inspection Friday", content: "Quarterly property inspection on 20 June at 10:00 AM. Please ensure common areas are tidy.", date: "12 Jun 2026", pinned: true, read: false },
  { id: "an2", title: "Water shutdown tomorrow", content: "Council water maintenance 9am–12pm. Store water if needed.", date: "13 Jun 2026", pinned: false, read: false },
  { id: "an3", title: "New internet provider installed", content: "Spark Fibre is now live. WiFi password updated — check Documents.", date: "5 Sep 2025", pinned: false, read: true },
];

export const MOCK_PROPERTY_HEALTH: PropertyHealth = {
  metrics: [
    { id: "ph1", label: "Rent Collection", score: 95 },
    { id: "ph2", label: "Maintenance", score: 100 },
    { id: "ph3", label: "Bills", score: 90 },
    { id: "ph4", label: "Rules Compliance", score: 98 },
  ],
  overall: 96,
};

export const DASHBOARD_QUICK_CARDS = [
  { id: "documents" as const, label: "Documents", icon: "📄", countKey: "documents" as const },
  { id: "bond-tracker" as const, label: "Bond", icon: "💰", countKey: null },
  { id: "lease-timeline" as const, label: "Lease", icon: "📅", countKey: null },
  { id: "announcements" as const, label: "Announcements", icon: "📢", countKey: "announcements" as const },
  { id: "checklists" as const, label: "Checklists", icon: "🧹", countKey: null },
  { id: "expenses" as const, label: "Expenses", icon: "💡", countKey: null },
  { id: "shopping-list" as const, label: "Shopping", icon: "🛒", countKey: "shopping" as const },
  { id: "flatmates" as const, label: "Flatmates", icon: "👥", countKey: null },
  { id: "visitors" as const, label: "Visitors", icon: "🚪", countKey: "visitors" as const },
  { id: "property-health" as const, label: "Health", icon: "📊", countKey: null },
];
