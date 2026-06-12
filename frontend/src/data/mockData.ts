import {
  ActivityItem,
  AppNotification,
  ChatMessage,
  ChatRoom,
  DashboardStats,
  MaintenanceRequest,
  Property,
  RentPayment,
  User,
} from "@/types";

export const MOCK_USER: User = {
  id: 1,
  email: "unikoh@homehub.co.nz",
  first_name: "Unikoh",
  last_name: "Walker",
  phone: "+64 21 555 0142",
  is_active: true,
  is_verified: true,
  role: "landlord",
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    owner_id: 1,
    name: "Mount Maunganui Apartment",
    address_line1: "12 Marine Parade",
    suburb: "Mount Maunganui",
    city: "Tauranga",
    postcode: "3116",
    property_type: "apartment",
    bedrooms: 2,
    bathrooms: 1,
    rent_amount: 720,
    bond_amount: 2880,
    rent_frequency: "week",
    tenant_count: 2,
    inspection_status: "passed",
    next_inspection: "2026-08-14",
    lease_start: "2025-09-01",
    lease_end: "2026-09-01",
    description:
      "Beachfront apartment with ocean views, steps from Mount Maunganui Main Beach and the cafe strip.",
    image_url:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    full_address: "12 Marine Parade, Mount Maunganui, Tauranga 3116",
  },
  {
    id: 2,
    owner_id: 1,
    name: "Tauranga Townhouse",
    address_line1: "8 Cameron Road",
    suburb: "Tauranga Central",
    city: "Tauranga",
    postcode: "3110",
    property_type: "townhouse",
    bedrooms: 3,
    bathrooms: 2,
    rent_amount: 640,
    bond_amount: 2560,
    rent_frequency: "week",
    tenant_count: 3,
    inspection_status: "due",
    next_inspection: "2026-06-20",
    lease_start: "2025-04-15",
    lease_end: "2026-04-15",
    description:
      "Modern three-bedroom townhouse close to the CBD, hospital and waterfront. Double garaging and a private courtyard.",
    image_url:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    full_address: "8 Cameron Road, Tauranga Central, Tauranga 3110",
  },
  {
    id: 3,
    owner_id: 1,
    name: "Papamoa Beach House",
    address_line1: "45 Papamoa Beach Road",
    suburb: "Papamoa",
    city: "Tauranga",
    postcode: "3118",
    property_type: "house",
    bedrooms: 4,
    bathrooms: 2,
    rent_amount: 850,
    bond_amount: 3400,
    rent_frequency: "week",
    tenant_count: 4,
    inspection_status: "scheduled",
    next_inspection: "2026-07-02",
    lease_start: "2025-11-01",
    lease_end: "2026-11-01",
    description:
      "Spacious family home a short walk from Papamoa Beach. Open-plan living, heat pump, fully fenced section.",
    image_url:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    full_address: "45 Papamoa Beach Road, Papamoa, Tauranga 3118",
  },
];

export const MOCK_RENT_PAYMENTS: RentPayment[] = [
  {
    id: 1,
    property_id: 1,
    property_name: "Mount Maunganui Apartment",
    amount: 720,
    due_date: "2026-06-16",
    status: "pending",
  },
  {
    id: 2,
    property_id: 2,
    property_name: "Tauranga Townhouse",
    amount: 640,
    due_date: "2026-06-08",
    payment_date: "2026-06-07",
    status: "paid",
    method: "Bank transfer",
  },
  {
    id: 3,
    property_id: 3,
    property_name: "Papamoa Beach House",
    amount: 850,
    due_date: "2026-06-01",
    payment_date: "2026-05-31",
    status: "paid",
    method: "Automatic payment",
  },
  {
    id: 4,
    property_id: 1,
    property_name: "Mount Maunganui Apartment",
    amount: 720,
    due_date: "2026-05-26",
    status: "overdue",
  },
  {
    id: 5,
    property_id: 2,
    property_name: "Tauranga Townhouse",
    amount: 640,
    due_date: "2026-05-18",
    payment_date: "2026-05-17",
    status: "paid",
    method: "Bank transfer",
  },
];

export const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 1,
    property_id: 1,
    property_name: "Mount Maunganui Apartment",
    submitted_by: "Aroha Ngata",
    title: "Leaking kitchen tap",
    description:
      "The hot water tap in the kitchen drips constantly and has started to stain the bench.",
    category: "Plumbing",
    priority: "medium",
    status: "submitted",
    created_at: "2026-06-10T09:15:00Z",
  },
  {
    id: 2,
    property_id: 3,
    property_name: "Papamoa Beach House",
    submitted_by: "James Patel",
    assigned_to: "Bay Heating Ltd",
    title: "Broken heat pump",
    description:
      "Lounge heat pump won't turn on. Error light is flashing and the unit makes a clicking sound.",
    category: "Heating",
    priority: "high",
    status: "in_progress",
    created_at: "2026-06-08T14:30:00Z",
  },
  {
    id: 3,
    property_id: 2,
    property_name: "Tauranga Townhouse",
    submitted_by: "Mia Thompson",
    assigned_to: "Coastal Fencing",
    title: "Fence repair after storm",
    description:
      "Two back fence panels blew loose in the last storm and need refixing before the dog can go outside.",
    category: "Exterior",
    priority: "low",
    status: "assigned",
    created_at: "2026-06-05T11:00:00Z",
  },
  {
    id: 4,
    property_id: 1,
    property_name: "Mount Maunganui Apartment",
    submitted_by: "Aroha Ngata",
    title: "Smoke alarm beeping",
    description:
      "Hallway smoke alarm is chirping every few minutes — likely a flat battery.",
    category: "Safety",
    priority: "urgent",
    status: "reviewing",
    created_at: "2026-06-11T19:45:00Z",
  },
  {
    id: 5,
    property_id: 3,
    property_name: "Papamoa Beach House",
    submitted_by: "James Patel",
    assigned_to: "Sparky Solutions",
    title: "Garage light not working",
    description: "Garage ceiling light stopped working after a power cut.",
    category: "Electrical",
    priority: "low",
    status: "completed",
    created_at: "2026-05-28T08:20:00Z",
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    notification_type: "rent_reminder",
    title: "Rent due in 4 days",
    body: "Weekly rent of $720 is due for Mount Maunganui Apartment on 16 June.",
    is_read: false,
    created_at: "2026-06-12T08:00:00Z",
  },
  {
    id: 2,
    notification_type: "maintenance_update",
    title: "Maintenance request assigned",
    body: "Heat pump repair at Papamoa Beach House assigned to Bay Heating Ltd.",
    is_read: false,
    created_at: "2026-06-11T14:30:00Z",
  },
  {
    id: 3,
    notification_type: "message",
    title: "New message from Aroha",
    body: "Thanks for sorting the tap so quickly!",
    is_read: false,
    created_at: "2026-06-11T10:05:00Z",
  },
  {
    id: 4,
    notification_type: "inspection",
    title: "Inspection due soon",
    body: "Routine inspection at Tauranga Townhouse scheduled for 20 June.",
    is_read: true,
    created_at: "2026-06-09T10:00:00Z",
  },
  {
    id: 5,
    notification_type: "payment_received",
    title: "Payment received",
    body: "$640 rent received for Tauranga Townhouse.",
    is_read: true,
    created_at: "2026-06-07T16:45:00Z",
  },
];

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    type: "rent",
    title: "Rent reminder sent",
    subtitle: "Mount Maunganui Apartment · $720",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "maintenance",
    title: "Maintenance request updated",
    subtitle: "Heat pump repair assigned to Bay Heating",
    time: "Yesterday",
  },
  {
    id: 3,
    type: "message",
    title: "New message received",
    subtitle: "Aroha Ngata · Mount Maunganui",
    time: "Yesterday",
  },
  {
    id: 4,
    type: "inspection",
    title: "Inspection scheduled",
    subtitle: "Tauranga Townhouse · 20 June",
    time: "3 days ago",
  },
];

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 1,
    name: "Aroha Ngata",
    role: "Tenant · Mount Maunganui",
    avatar_color: "#3b82f6",
    property_name: "Mount Maunganui Apartment",
    last_message: "Thanks for sorting the tap so quickly!",
    last_time: "10:05",
    unread_count: 2,
    online: true,
  },
  {
    id: 2,
    name: "Bay Heating Ltd",
    role: "Contractor",
    avatar_color: "#f59e0b",
    property_name: "Papamoa Beach House",
    last_message: "We can come out Thursday morning to look at the heat pump.",
    last_time: "Yesterday",
    unread_count: 1,
    online: false,
  },
  {
    id: 3,
    name: "James Patel",
    role: "Tenant · Papamoa",
    avatar_color: "#22c55e",
    property_name: "Papamoa Beach House",
    last_message: "All good, the garage light is working again. Cheers!",
    last_time: "Mon",
    unread_count: 0,
    online: true,
  },
  {
    id: 4,
    name: "Mia Thompson",
    role: "Tenant · Tauranga",
    avatar_color: "#a855f7",
    property_name: "Tauranga Townhouse",
    last_message: "When is the next inspection booked for?",
    last_time: "Sun",
    unread_count: 0,
    online: false,
  },
];

export const MOCK_CHAT_MESSAGES: Record<number, ChatMessage[]> = {
  1: [
    { id: 1, room_id: 1, sender_id: 2, sender_name: "Aroha Ngata", content: "Hi Unikoh, the kitchen tap is leaking again.", created_at: "2026-06-10T09:10:00Z", is_mine: false },
    { id: 2, room_id: 1, sender_id: 1, sender_name: "You", content: "Thanks for letting me know — I'll get a plumber booked in this week.", created_at: "2026-06-10T09:20:00Z", is_mine: true },
    { id: 3, room_id: 1, sender_id: 2, sender_name: "Aroha Ngata", content: "Perfect, any morning works for us.", created_at: "2026-06-10T09:25:00Z", is_mine: false },
    { id: 4, room_id: 1, sender_id: 1, sender_name: "You", content: "Booked for Thursday 9am. The plumber's name is Dave.", created_at: "2026-06-11T16:40:00Z", is_mine: true },
    { id: 5, room_id: 1, sender_id: 2, sender_name: "Aroha Ngata", content: "Thanks for sorting the tap so quickly!", created_at: "2026-06-11T10:05:00Z", is_mine: false },
  ],
  2: [
    { id: 1, room_id: 2, sender_id: 3, sender_name: "Bay Heating Ltd", content: "Hi, we received the heat pump job for Papamoa Beach House.", created_at: "2026-06-09T11:00:00Z", is_mine: false },
    { id: 2, room_id: 2, sender_id: 1, sender_name: "You", content: "Great, the tenants say it won't turn on and the light is flashing.", created_at: "2026-06-09T11:15:00Z", is_mine: true },
    { id: 3, room_id: 2, sender_id: 3, sender_name: "Bay Heating Ltd", content: "We can come out Thursday morning to look at the heat pump.", created_at: "2026-06-09T11:30:00Z", is_mine: false },
  ],
  3: [
    { id: 1, room_id: 3, sender_id: 4, sender_name: "James Patel", content: "All good, the garage light is working again. Cheers!", created_at: "2026-06-08T18:00:00Z", is_mine: false },
  ],
  4: [
    { id: 1, room_id: 4, sender_id: 5, sender_name: "Mia Thompson", content: "When is the next inspection booked for?", created_at: "2026-06-07T13:00:00Z", is_mine: false },
    { id: 2, room_id: 4, sender_id: 1, sender_name: "You", content: "Hi Mia, it's scheduled for 20 June at 10am.", created_at: "2026-06-07T13:30:00Z", is_mine: true },
  ],
};

export function buildDashboardStats(
  properties: Property[],
  payments: RentPayment[],
  maintenance: MaintenanceRequest[],
  unreadMessages: number,
): DashboardStats {
  const rentDue = payments
    .filter((p) => p.status !== "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const monthlyIncome = properties.reduce(
    (sum, p) => sum + p.rent_amount * 4,
    0,
  );
  const openMaintenance = maintenance.filter(
    (m) => m.status !== "completed",
  ).length;

  return {
    rent_due: rentDue,
    rent_due_label: "Due this week",
    active_properties: properties.length,
    open_maintenance: openMaintenance,
    unread_messages: unreadMessages,
    monthly_income: monthlyIncome,
    occupancy_rate: 96,
  };
}
