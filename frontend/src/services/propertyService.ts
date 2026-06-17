import axios from "axios";
import { DEFAULT_RULES } from "../../data/constants";
import { MOCK_PROPERTIES } from "../../data/mockProperties";
import { Property, PropertyFormData } from "../../types/property";
import {
  ApiProperty,
  fromApiProperty,
  isNumericPropertyId,
  toApiCreatePayload,
  toApiUpdatePayload,
} from "../utils/propertyMapper";
import api, { API_V1_URL, getApiErrorMessage } from "./api";
import { getToken, saveToken } from "./tokenStorage";
import { isMockMode } from "../utils/dataSource";

export type PropertyDataSource = "api" | "mock";

export interface PropertyListResult {
  data: Property[];
  source: PropertyDataSource;
  error?: string;
}

export interface PropertySearchFilters {
  city?: string;
  min_rent?: number;
  max_rent?: number;
  min_rooms?: number;
  min_bedrooms?: number;
  property_type?: string;
  query?: string;
}

let usingApi = false;

export function isUsingLiveApi(): boolean {
  return usingApi;
}

async function tryDevLogin(): Promise<boolean> {
  const email = process.env.EXPO_PUBLIC_DEV_EMAIL;
  const password = process.env.EXPO_PUBLIC_DEV_PASSWORD;
  if (!email || !password) return false;

  try {
    const { data } = await axios.post(`${API_V1_URL}/auth/login`, {
      email,
      password,
    });
    await saveToken(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function ensureAuth(): Promise<void> {
  const token = await getToken();
  if (token) return;
  await tryDevLogin();
}

function withMockFallback(
  error: unknown,
  cached?: Property[],
  reason?: string,
): PropertyListResult {
  usingApi = false;
  if (cached?.length) {
    return {
      data: cached,
      source: "api",
      error: reason ?? getApiErrorMessage(error),
    };
  }
  if (!isMockMode()) {
    return {
      data: [],
      source: "api",
      error: reason ?? getApiErrorMessage(error),
    };
  }
  return {
    data: MOCK_PROPERTIES,
    source: "mock",
    error: reason ?? getApiErrorMessage(error),
  };
}

function buildLocalProperty(form: PropertyFormData, id?: string): Property {
  const weeklyRent = parseFloat(form.weekly_rent) || 0;
  return {
    id: id ?? `local-${Date.now()}`,
    name: form.name.trim(),
    address: form.address.trim(),
    suburb: form.suburb.trim() || "Tauranga",
    city: form.city.trim() || "Tauranga",
    property_type: form.property_type,
    bedrooms: parseInt(form.bedrooms, 10) || 1,
    bathrooms: parseInt(form.bathrooms, 10) || 1,
    weekly_rent: weeklyRent,
    bond: parseFloat(form.bond) || weeklyRent * 4,
    available_rooms: parseInt(form.available_rooms, 10) || 1,
    max_flatmates: parseInt(form.max_flatmates, 10) || 2,
    flatmate_count: 0,
    description: form.description.trim() || "New Zealand rental property.",
    rules: (() => {
      const parsed = form.rules.split(",").map((r) => r.trim()).filter(Boolean);
      return parsed.length ? parsed : DEFAULT_RULES;
    })(),
    image_url:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
  };
}

function mergeLocalProperty(
  existing: Property,
  form: PropertyFormData,
  weeklyRentOverride?: number,
): Property {
  const weeklyRent =
    weeklyRentOverride ?? (parseFloat(form.weekly_rent) || existing.weekly_rent);
  return {
    ...existing,
    name: form.name.trim() || existing.name,
    address: form.address.trim() || existing.address,
    suburb: form.suburb.trim() || existing.suburb,
    city: form.city.trim() || existing.city,
    property_type: form.property_type,
    bedrooms: parseInt(form.bedrooms, 10) || existing.bedrooms,
    bathrooms: parseInt(form.bathrooms, 10) || existing.bathrooms,
    weekly_rent: weeklyRent,
    bond: parseFloat(form.bond) || existing.bond,
    available_rooms: parseInt(form.available_rooms, 10) || existing.available_rooms,
    max_flatmates: parseInt(form.max_flatmates, 10) || existing.max_flatmates,
    description: form.description.trim() || existing.description,
    rules: form.rules
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean),
  };
}

function mapList(
  data: ApiProperty[],
  existing?: Property[],
): Property[] {
  const byId = new Map((existing ?? []).map((p) => [p.id, p]));
  return data.map((item) => fromApiProperty(item, byId.get(String(item.id))));
}

export type NewPropertyInput = Omit<
  Property,
  "id" | "rules" | "image_url"
> & { image_url?: string };

export const propertyService = {
  async getProperties(existing?: Property[]): Promise<PropertyListResult> {
    try {
      await ensureAuth();
      const { data } = await api.get<ApiProperty[]>("/properties");

      if (!data?.length) {
        usingApi = true;
        return { data: [], source: "api" };
      }

      usingApi = true;
      return { data: mapList(data, existing), source: "api" };
    } catch (error) {
      const cached = existing?.length ? existing : undefined;
      return withMockFallback(error, cached);
    }
  },

  async getPropertyById(
    id: string,
    existing?: Property,
  ): Promise<{
    property: Property | null;
    source: PropertyDataSource;
    error?: string;
  }> {
    if (!isNumericPropertyId(id)) {
      const local = MOCK_PROPERTIES.find((p) => p.id === id) ?? existing ?? null;
      return { property: local, source: "mock" };
    }

    try {
      await ensureAuth();
      const { data } = await api.get<ApiProperty>(`/properties/${id}`);
      usingApi = true;
      return { property: fromApiProperty(data, existing), source: "api" };
    } catch (error) {
      const fallback = MOCK_PROPERTIES.find((p) => p.id === id) ?? existing ?? null;
      return {
        property: fallback,
        source: "mock",
        error: getApiErrorMessage(error),
      };
    }
  },

  async createProperty(form: PropertyFormData): Promise<{
    property: Property;
    source: PropertyDataSource;
    error?: string;
  }> {
    try {
      await ensureAuth();
      const { data } = await api.post<ApiProperty>(
        "/properties",
        toApiCreatePayload(form),
      );
      usingApi = true;
      return { property: fromApiProperty(data), source: "api" };
    } catch (error) {
      return {
        property: buildLocalProperty(form),
        source: "mock",
        error: getApiErrorMessage(error),
      };
    }
  },

  async updateProperty(
    id: string,
    form: PropertyFormData,
    existing: Property,
    weeklyRentOverride?: number,
  ): Promise<{
    property: Property;
    source: PropertyDataSource;
    error?: string;
  }> {
    const local = mergeLocalProperty(existing, form, weeklyRentOverride);

    if (!usingApi || !isNumericPropertyId(id)) {
      return { property: local, source: "mock" };
    }

    try {
      const { data } = await api.put<ApiProperty>(
        `/properties/${id}`,
        toApiUpdatePayload(form, weeklyRentOverride),
      );
      return { property: fromApiProperty(data, local), source: "api" };
    } catch (error) {
      return { property: local, source: "mock", error: getApiErrorMessage(error) };
    }
  },

  async uploadPropertyPhoto(
    id: string,
    file: { uri: string; name: string; type: string },
  ): Promise<{ imageUrl: string; source: PropertyDataSource; error?: string }> {
    if (!usingApi || !isNumericPropertyId(id)) {
      return { imageUrl: file.uri, source: "mock" };
    }
    try {
      const form = new FormData();
      form.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob);
      const { data } = await api.post<ApiProperty>(`/properties/${id}/photo`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const urls = data.image_urls ?? [];
      return {
        imageUrl: urls[0] ?? file.uri,
        source: "api",
      };
    } catch (error) {
      return { imageUrl: file.uri, source: "mock", error: getApiErrorMessage(error) };
    }
  },

  async deleteProperty(id: string): Promise<{
    ok: boolean;
    source: PropertyDataSource;
    error?: string;
  }> {
    if (!usingApi || !isNumericPropertyId(id)) {
      return { ok: true, source: "mock" };
    }

    try {
      await api.delete(`/properties/${id}`);
      return { ok: true, source: "api" };
    } catch (error) {
      return { ok: false, source: "mock", error: getApiErrorMessage(error) };
    }
  },

  async searchProperties(
    filters: PropertySearchFilters,
    existing?: Property[],
  ): Promise<PropertyListResult> {
    try {
      await ensureAuth();
      const { data } = await api.get<ApiProperty[]>("/properties/search", {
        params: filters,
      });
      usingApi = true;
      return { data: mapList(data ?? [], existing), source: "api" };
    } catch (error) {
      const q = (filters.query ?? filters.city ?? "").toLowerCase();
      const filtered = MOCK_PROPERTIES.filter((p) => {
        const cityMatch = !filters.city || p.city.toLowerCase().includes(filters.city.toLowerCase());
        const rentMatch =
          (filters.min_rent === undefined || p.weekly_rent >= filters.min_rent) &&
          (filters.max_rent === undefined || p.weekly_rent <= filters.max_rent);
        const roomsMatch =
          filters.min_rooms === undefined || p.available_rooms >= filters.min_rooms;
        const bedsMatch =
          filters.min_bedrooms === undefined || p.bedrooms >= filters.min_bedrooms;
        const textMatch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.suburb.toLowerCase().includes(q);
        return cityMatch && rentMatch && roomsMatch && bedsMatch && textMatch;
      });
      return {
        data: filtered,
        source: "mock",
        error: getApiErrorMessage(error),
      };
    }
  },

  async getMyFlat(existing?: Property): Promise<{
    property: Property | null;
    source: PropertyDataSource;
    error?: string;
  }> {
    try {
      await ensureAuth();
      const { data } = await api.get<ApiProperty | null>("/properties/my-flat");
      if (!data) {
        usingApi = true;
        return { property: null, source: "api" };
      }
      usingApi = true;
      return { property: fromApiProperty(data, existing), source: "api" };
    } catch (error) {
      return {
        property: existing ?? null,
        source: "mock",
        error: getApiErrorMessage(error),
      };
    }
  },

  /** Expo Router stack compatibility */
  async list(): Promise<Property[]> {
    const result = await propertyService.getProperties();
    return result.data;
  },

  async get(id: number): Promise<Property | undefined> {
    const result = await propertyService.getPropertyById(String(id));
    return result.property ?? undefined;
  },

  async search(filters: PropertySearchFilters): Promise<Property[]> {
    const result = await propertyService.searchProperties(filters);
    return result.data;
  },

  async create(input: NewPropertyInput): Promise<Property> {
    const form: PropertyFormData = {
      name: input.name,
      address: input.address,
      suburb: input.suburb,
      city: input.city,
      property_type: input.property_type,
      bedrooms: String(input.bedrooms),
      bathrooms: String(input.bathrooms),
      weekly_rent: String(input.weekly_rent),
      bond: String(input.bond),
      available_rooms: String(input.available_rooms),
      max_flatmates: String(input.max_flatmates),
      description: input.description,
      rules: "",
    };
    const result = await propertyService.createProperty(form);
    return result.property;
  },
};

export const getProperties = propertyService.getProperties.bind(propertyService);
export const getPropertyById = propertyService.getPropertyById.bind(propertyService);
export const createProperty = propertyService.createProperty.bind(propertyService);
export const updateProperty = propertyService.updateProperty.bind(propertyService);
export const deleteProperty = propertyService.deleteProperty.bind(propertyService);

// Backward compatibility with propertyApi consumers
export const propertyApi = propertyService;
