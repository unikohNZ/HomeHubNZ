import { User } from "../types/user";

export const FLATMATE_USER: User = {
  id: "u1",
  name: "Unikoh Gwapo",
  email: "unikoh@homehub.co.nz",
  role: "flatmate",
  avatar_color: "#3b82f6",
  location: "Tauranga",
  verified: true,
};

export const LANDLORD_USER: User = {
  id: "u2",
  name: "Aroha Williams",
  email: "aroha@homehub.co.nz",
  role: "landlord",
  avatar_color: "#22c55e",
  location: "Bay of Plenty",
  verified: true,
};

export const MOCK_FLATMATES = [
  { name: "Unikoh Gwapo", color: "#3b82f6" },
  { name: "Aroha Ngata", color: "#a855f7" },
  { name: "Mia Thompson", color: "#f59e0b" },
  { name: "James Patel", color: "#22c55e" },
];
