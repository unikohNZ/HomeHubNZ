import { User } from "../types/user";
import { FLATMATE_USER, LANDLORD_USER } from "./mockUsers";

export const DEMO_FLATMATE_EMAIL = "flatmate@homehub.co.nz";
export const DEMO_LANDLORD_EMAIL = "landlord@homehub.co.nz";
export const DEMO_PASSWORD = "123456";

export function validateDemoLogin(email: string, password: string): User | null {
  const normalized = email.trim().toLowerCase();
  if (password !== DEMO_PASSWORD) return null;
  if (normalized === DEMO_FLATMATE_EMAIL) return { ...FLATMATE_USER };
  if (normalized === DEMO_LANDLORD_EMAIL) return { ...LANDLORD_USER };
  return null;
}
