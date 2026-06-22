import { DEFAULT_RULES } from "../../data/constants";
import { Property, PropertyFormData, PropertyType } from "../../types/property";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80";

export interface ApiProperty {
  id: number;
  owner_id: number;
  name?: string;
  address?: string;
  address_line1: string;
  address_line2?: string | null;
  suburb: string;
  city: string;
  postcode: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  weekly_rent?: number | string;
  rent_amount: number | string;
  bond_amount: number | string;
  available_rooms?: number;
  max_flatmates?: number;
  flatmate_count?: number;
  occupancy?: string;
  rent_frequency?: string;
  description?: string | null;
  image_urls?: string[] | null;
  full_address: string;
  lease_start?: string | null;
  lease_end?: string | null;
  region?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
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

function toNumber(value: number | string | undefined): number {
  if (value === undefined) return 0;
  return typeof value === "number" ? value : parseFloat(value) || 0;
}

function formatLeaseDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

export function fromApiProperty(api: ApiProperty, existing?: Property): Property {
  const weeklyRent = toNumber(api.weekly_rent ?? api.rent_amount);
  const bond = toNumber(api.bond_amount);
  const maxFlatmates = api.max_flatmates ?? Math.max(2, api.bedrooms);
  const flatmateCount =
    api.flatmate_count ??
    Math.max(0, maxFlatmates - (api.available_rooms ?? maxFlatmates - 1));

  return {
    id: String(api.id),
    name: api.name?.trim() || api.address_line2?.trim() || api.address?.trim() || api.address_line1,
    address: api.address ?? api.address_line1,
    suburb: api.suburb,
    city: api.city,
    property_type: API_TO_UI_TYPE[api.property_type] ?? "Apartment",
    bedrooms: api.bedrooms,
    bathrooms: api.bathrooms,
    weekly_rent: weeklyRent,
    bond,
    available_rooms: api.available_rooms ?? Math.max(1, api.bedrooms - 1),
    max_flatmates: maxFlatmates,
    flatmate_count: flatmateCount,
    description: api.description?.trim() || "New Zealand rental property.",
    rules: existing?.rules ?? DEFAULT_RULES,
    image_url: api.image_urls?.[0] ?? existing?.image_url ?? DEFAULT_IMAGE,
    lease_start: formatLeaseDate(api.lease_start) ?? existing?.lease_start,
    lease_end: formatLeaseDate(api.lease_end) ?? existing?.lease_end,
    latitude: api.latitude ?? existing?.latitude,
    longitude: api.longitude ?? existing?.longitude,
    distance_km: api.distance_km ?? existing?.distance_km,
    region: api.region ?? existing?.region,
  };
}

export function toApiCreatePayload(form: PropertyFormData) {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    suburb: form.suburb.trim() || "Tauranga",
    city: form.city.trim() || "Tauranga",
    postcode: "3110",
    property_type: UI_TO_API_TYPE[form.property_type] ?? "apartment",
    bedrooms: parseInt(form.bedrooms, 10) || 1,
    bathrooms: parseInt(form.bathrooms, 10) || 1,
    weekly_rent: parseFloat(form.weekly_rent) || 0,
    bond_amount: parseFloat(form.bond) || (parseFloat(form.weekly_rent) || 0) * 4,
    available_rooms: parseInt(form.available_rooms, 10) || 1,
    max_flatmates: parseInt(form.max_flatmates, 10) || 2,
    description: form.description.trim() || "New Zealand rental property.",
  };
}

export function toApiUpdatePayload(
  form: PropertyFormData,
  weeklyRentOverride?: number,
) {
  const weeklyRent =
    weeklyRentOverride ?? parseFloat(form.weekly_rent);
  const bond = parseFloat(form.bond);

  return {
    name: form.name.trim(),
    address: form.address.trim(),
    suburb: form.suburb.trim(),
    city: form.city.trim(),
    property_type: UI_TO_API_TYPE[form.property_type] ?? "apartment",
    bedrooms: parseInt(form.bedrooms, 10),
    bathrooms: parseInt(form.bathrooms, 10),
    weekly_rent: Number.isFinite(weeklyRent) ? weeklyRent : undefined,
    bond_amount: Number.isFinite(bond) ? bond : undefined,
    available_rooms: parseInt(form.available_rooms, 10),
    max_flatmates: parseInt(form.max_flatmates, 10),
    description: form.description.trim(),
  };
}

/** Snake_case payload for PUT /properties/{id} */
export const toPropertyUpdatePayload = toApiUpdatePayload;

export function isNumericPropertyId(id: string): boolean {
  return /^\d+$/.test(id);
}
