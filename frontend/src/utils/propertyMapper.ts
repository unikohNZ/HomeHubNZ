import { DEFAULT_RULES } from "../../data/constants";
import { Property, PropertyFormData, PropertyType } from "../../types/property";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80";

export interface ApiProperty {
  id: number;
  owner_id: number;
  address_line1: string;
  address_line2?: string | null;
  suburb: string;
  city: string;
  postcode: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number | string;
  bond_amount: number | string;
  rent_frequency?: string;
  description?: string | null;
  image_urls?: string[] | null;
  full_address: string;
}

const UI_TO_API_TYPE: Record<PropertyType, string> = {
  Apartment: "apartment",
  Townhouse: "townhouse",
  House: "house",
  Unit: "unit",
  Studio: "studio",
};

const API_TO_UI_TYPE: Record<string, PropertyType> = {
  apartment: "Apartment",
  townhouse: "Townhouse",
  house: "House",
  unit: "Unit",
  studio: "Studio",
};

function toNumber(value: number | string): number {
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

export function fromApiProperty(
  api: ApiProperty,
  existing?: Property,
): Property {
  const weeklyRent = toNumber(api.rent_amount);
  const bond = toNumber(api.bond_amount);
  const maxFlatmates = existing?.max_flatmates ?? Math.max(2, api.bedrooms);

  return {
    id: String(api.id),
    name: api.address_line2?.trim() || api.address_line1,
    address: api.address_line1,
    suburb: api.suburb,
    city: api.city,
    property_type: API_TO_UI_TYPE[api.property_type] ?? "Apartment",
    bedrooms: api.bedrooms,
    bathrooms: api.bathrooms,
    weekly_rent: weeklyRent,
    bond,
    available_rooms: existing?.available_rooms ?? Math.max(1, api.bedrooms - 1),
    max_flatmates: maxFlatmates,
    flatmate_count: existing?.flatmate_count ?? 0,
    description: api.description?.trim() || "New Zealand rental property.",
    rules: existing?.rules ?? DEFAULT_RULES,
    image_url: api.image_urls?.[0] ?? existing?.image_url ?? DEFAULT_IMAGE,
    lease_start: existing?.lease_start,
    lease_end: existing?.lease_end,
  };
}

export function toApiCreatePayload(form: PropertyFormData) {
  return {
    address_line1: form.address.trim(),
    address_line2: form.name.trim() || null,
    suburb: form.suburb.trim() || "Tauranga",
    city: form.city.trim() || "Tauranga",
    postcode: "3110",
    property_type: UI_TO_API_TYPE[form.property_type] ?? "apartment",
    bedrooms: parseInt(form.bedrooms, 10) || 1,
    bathrooms: parseInt(form.bathrooms, 10) || 1,
    rent_amount: parseFloat(form.weekly_rent) || 0,
    bond_amount:
      parseFloat(form.bond) || (parseFloat(form.weekly_rent) || 0) * 4,
    rent_frequency: "weekly",
    description: form.description.trim() || "New Zealand rental property.",
  };
}

export function toApiUpdatePayload(
  form: PropertyFormData,
  weeklyRentOverride?: number,
) {
  const weeklyRent =
    weeklyRentOverride ?? (parseFloat(form.weekly_rent) || undefined);

  return {
    address_line1: form.address.trim() || undefined,
    address_line2: form.name.trim() || undefined,
    suburb: form.suburb.trim() || undefined,
    city: form.city.trim() || undefined,
    property_type: UI_TO_API_TYPE[form.property_type] ?? undefined,
    bedrooms: parseInt(form.bedrooms, 10) || undefined,
    bathrooms: parseInt(form.bathrooms, 10) || undefined,
    rent_amount: weeklyRent,
    bond_amount: parseFloat(form.bond) || undefined,
    description: form.description.trim() || undefined,
  };
}

export function isNumericPropertyId(id: string): boolean {
  return /^\d+$/.test(id);
}
