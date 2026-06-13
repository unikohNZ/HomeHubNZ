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
import { tokenStorage } from "./tokenStorage";
import axios from "axios";

export type PropertyDataSource = "api" | "mock";

export interface PropertyListResult {
  data: Property[];
  source: PropertyDataSource;
  error?: string;
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
    await tokenStorage.setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function ensureAuth(): Promise<void> {
  const token = await tokenStorage.getAccessToken();
  if (token) return;
  await tryDevLogin();
}

function withMockFallback(
  error: unknown,
  reason?: string,
): PropertyListResult {
  usingApi = false;
  return {
    data: MOCK_PROPERTIES,
    source: "mock",
    error: reason ?? getApiErrorMessage(error),
  };
}

export const propertyApi = {
  async list(existing?: Property[]): Promise<PropertyListResult> {
    try {
      await ensureAuth();
      const { data } = await api.get<ApiProperty[]>("/properties");
      const byId = new Map((existing ?? []).map((p) => [p.id, p]));

      if (!data?.length) {
        return {
          data: MOCK_PROPERTIES,
          source: "mock",
          error: "API returned no properties — showing demo listings",
        };
      }

      usingApi = true;
      return {
        data: data.map((item) =>
          fromApiProperty(item, byId.get(String(item.id))),
        ),
        source: "api",
      };
    } catch (error) {
      return withMockFallback(error);
    }
  },

  async create(form: PropertyFormData): Promise<{
    property: Property;
    source: PropertyDataSource;
    error?: string;
  }> {
    if (!usingApi) {
      return { property: buildLocalProperty(form), source: "mock" };
    }

    try {
      const { data } = await api.post<ApiProperty>(
        "/properties",
        toApiCreatePayload(form),
      );
      return { property: fromApiProperty(data), source: "api" };
    } catch (error) {
      return {
        property: buildLocalProperty(form),
        source: "mock",
        error: getApiErrorMessage(error),
      };
    }
  },

  async update(
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
      return {
        property: fromApiProperty(data, local),
        source: "api",
      };
    } catch (error) {
      return { property: local, source: "mock", error: getApiErrorMessage(error) };
    }
  },

  async remove(id: string): Promise<{
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
};

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
