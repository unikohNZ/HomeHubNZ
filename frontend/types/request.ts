export type JoinStatus = "pending" | "approved" | "rejected";

export interface JoinRequest {
  id: string;
  property_id: string;
  flatmate_name: string;
  flatmate_email: string;
  message: string;
  status: JoinStatus;
  created_at: string;
}
