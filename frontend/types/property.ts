export type PropertyType = "Apartment" | "Townhouse" | "House" | "Unit" | "Studio";

export interface Property {
  id: string;
  name: string;
  address: string;
  suburb: string;
  city: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  weekly_rent: number;
  bond: number;
  available_rooms: number;
  max_flatmates: number;
  flatmate_count: number;
  description: string;
  rules: string[];
  image_url: string;
  lease_start?: string;
  lease_end?: string;
}

export interface PropertyFormData {
  name: string;
  address: string;
  suburb: string;
  city: string;
  property_type: PropertyType;
  bedrooms: string;
  bathrooms: string;
  weekly_rent: string;
  bond: string;
  available_rooms: string;
  max_flatmates: string;
  description: string;
  rules: string;
}
