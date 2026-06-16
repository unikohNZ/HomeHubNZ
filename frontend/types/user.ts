export type UserRole = "flatmate" | "landlord" | "tenant" | "property_manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_color: string;
  avatar_url?: string;
  location: string;
  verified: boolean;
}
