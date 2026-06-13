import { JoinRequest } from "../types/request";
import { FLATMATE_USER } from "./mockUsers";

export const DEMO_APPROVED_JOIN: JoinRequest = {
  id: "jr-demo",
  property_id: "1",
  flatmate_name: FLATMATE_USER.name,
  flatmate_email: FLATMATE_USER.email,
  message: "Welcome to the flat!",
  status: "approved",
  created_at: "10 Jun 2026",
};
