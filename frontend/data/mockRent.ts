import { RentPayment } from "../types/rent";

export const MOCK_RENT_PAYMENTS: RentPayment[] = [
  {
    id: "r1",
    property_id: "1",
    property_name: "Mount Maunganui Apartment",
    amount: 360,
    due_date: "2026-06-16",
  },
  {
    id: "r2",
    property_id: "1",
    property_name: "Mount Maunganui Apartment",
    amount: 360,
    due_date: "2026-06-13",
  },
  {
    id: "r3",
    property_id: "2",
    property_name: "Tauranga Townhouse",
    amount: 320,
    due_date: "2026-06-12",
  },
  {
    id: "r4",
    property_id: "1",
    property_name: "Mount Maunganui Apartment",
    amount: 360,
    due_date: "2026-06-10",
  },
  {
    id: "r5",
    property_id: "2",
    property_name: "Tauranga Townhouse",
    amount: 320,
    due_date: "2026-06-01",
    payment_date: "2026-06-01",
    method: "Bank transfer",
  },
  {
    id: "r6",
    property_id: "3",
    property_name: "Papamoa Beach House",
    amount: 425,
    due_date: "2026-05-25",
    payment_date: "2026-05-24",
    method: "Automatic payment",
  },
  {
    id: "r7",
    property_id: "1",
    property_name: "Mount Maunganui Apartment",
    amount: 360,
    due_date: "2026-05-18",
    payment_date: "2026-05-17",
    method: "Bank transfer",
  },
];
