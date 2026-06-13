import { PropertyFormData, PropertyType } from "../types/property";
import { DEFAULT_RULES_TEXT } from "./constants";

export const EMPTY_PROPERTY_FORM: PropertyFormData = {
  name: "",
  address: "",
  suburb: "Tauranga",
  city: "Tauranga",
  property_type: "Apartment" as PropertyType,
  bedrooms: "2",
  bathrooms: "1",
  weekly_rent: "",
  bond: "",
  available_rooms: "1",
  max_flatmates: "2",
  description: "",
  rules: DEFAULT_RULES_TEXT,
};

let uid = 100;
export function nextId() {
  return String(++uid);
}
