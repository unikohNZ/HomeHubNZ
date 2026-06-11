import {
  DashboardStats,
  MaintenanceRequest,
  Notification,
  Property,
  RentPayment,
  User,
} from "@/types";

export const MOCK_USER: User = {
  id: 1,
  email: "sarah.mitchell@example.co.nz",
  first_name: "Sarah",
  last_name: "Mitchell",
  phone: "+64 21 555 0142",
  is_active: true,
  is_verified: true,
  role: "landlord",
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    owner_id: 1,
    address_line1: "42 Ponsonby Road",
    suburb: "Ponsonby",
    city: "Auckland",
    postcode: "1011",
    property_type: "apartment",
    bedrooms: 2,
    bathrooms: 1,
    rent_amount: 620,
    bond_amount: 2480,
    rent_frequency: "week",
    description: "Modern apartment near Victoria Park with city views.",
    full_address: "42 Ponsonby Road, Ponsonby, Auckland 1011",
  },
  {
    id: 2,
    owner_id: 1,
    address_line1: "18 Cuba Street",
    suburb: "Te Aro",
    city: "Wellington",
    postcode: "6011",
    property_type: "townhouse",
    bedrooms: 3,
    bathrooms: 2,
    rent_amount: 750,
    bond_amount: 3000,
    rent_frequency: "week",
    description: "Character townhouse in the heart of Wellington.",
    full_address: "18 Cuba Street, Te Aro, Wellington 6011",
  },
  {
    id: 3,
    owner_id: 1,
    address_line1: "7 Riccarton Road",
    suburb: "Riccarton",
    city: "Christchurch",
    postcode: "8041",
    property_type: "house",
    bedrooms: 4,
    bathrooms: 2,
    rent_amount: 680,
    bond_amount: 2720,
    rent_frequency: "week",
    description: "Family home close to University of Canterbury.",
    full_address: "7 Riccarton Road, Riccarton, Christchurch 8041",
  },
];

export const MOCK_RENT_PAYMENTS: RentPayment[] = [
  { id: 1, lease_id: 1, amount: 620, due_date: "2026-06-15", status: "pending" },
  { id: 2, lease_id: 2, amount: 750, due_date: "2026-06-08", status: "paid", payment_date: "2026-06-07" },
  { id: 3, lease_id: 3, amount: 680, due_date: "2026-06-01", status: "paid", payment_date: "2026-05-31" },
  { id: 4, lease_id: 1, amount: 620, due_date: "2026-05-25", status: "overdue" },
  { id: 5, lease_id: 2, amount: 750, due_date: "2026-05-18", status: "paid", payment_date: "2026-05-17" },
];

export const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 1,
    property_id: 1,
    submitted_by: 2,
    title: "Leaking kitchen tap",
    description: "Hot water tap dripping constantly in the kitchen sink.",
    category: "Plumbing",
    priority: "medium",
    status: "submitted",
  },
  {
    id: 2,
    property_id: 2,
    submitted_by: 3,
    assigned_to: 5,
    title: "Broken heat pump remote",
    description: "Heat pump remote not responding, unit stuck on cooling.",
    category: "Heating",
    priority: "high",
    status: "in_progress",
  },
  {
    id: 3,
    property_id: 3,
    submitted_by: 4,
    title: "Fence panel loose after storm",
    description: "Back fence panel damaged in recent weather event.",
    category: "Exterior",
    priority: "low",
    status: "assigned",
  },
  {
    id: 4,
    property_id: 1,
    submitted_by: 2,
    title: "Smoke alarm battery replacement",
    description: "Hallway smoke alarm chirping intermittently.",
    category: "Safety",
    priority: "urgent",
    status: "reviewing",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    notification_type: "rent_reminder",
    title: "Rent due in 3 days",
    body: "Weekly rent of $620 due for 42 Ponsonby Road.",
    is_read: false,
    created_at: "2026-06-11T08:00:00Z",
  },
  {
    id: 2,
    notification_type: "maintenance_update",
    title: "Maintenance request updated",
    body: "Heat pump repair assigned to Kiwi Climate Services.",
    is_read: false,
    created_at: "2026-06-10T14:30:00Z",
  },
  {
    id: 3,
    notification_type: "inspection",
    title: "Inspection scheduled",
    body: "Routine inspection at 18 Cuba Street on 20 June.",
    is_read: true,
    created_at: "2026-06-09T10:00:00Z",
  },
  {
    id: 4,
    notification_type: "payment_received",
    title: "Payment received",
    body: "$750 rent received for Wellington property.",
    is_read: true,
    created_at: "2026-06-07T16:45:00Z",
  },
];

export const MOCK_DASHBOARD: DashboardStats = {
  upcomingRent: MOCK_RENT_PAYMENTS[0],
  activeProperties: MOCK_PROPERTIES.length,
  maintenanceCount: MOCK_MAINTENANCE.filter((r) => r.status !== "completed").length,
  outstandingRent: 620,
  monthlyIncome: 8450,
};

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    await delay();
    return MOCK_DASHBOARD;
  },
  getProperties: async (): Promise<Property[]> => {
    await delay();
    return MOCK_PROPERTIES;
  },
  getRentPayments: async (): Promise<RentPayment[]> => {
    await delay();
    return MOCK_RENT_PAYMENTS;
  },
  getMaintenance: async (): Promise<MaintenanceRequest[]> => {
    await delay();
    return MOCK_MAINTENANCE;
  },
  getNotifications: async (): Promise<Notification[]> => {
    await delay();
    return MOCK_NOTIFICATIONS;
  },
};
