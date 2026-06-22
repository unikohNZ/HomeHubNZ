import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { isMockMode } from "../utils/dataSource";

const RECENT_KEY = "homehub:recent_locations";
const MAX_RECENT = 3;

export interface UserLocation {
  preferred_location_name: string | null;
  preferred_latitude: number | null;
  preferred_longitude: number | null;
}

export interface LocationSuggestion {
  label: string;
  latitude: number;
  longitude: number;
}

export const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  { label: "Mount Maunganui, Tauranga", latitude: -37.638, longitude: 176.183 },
  { label: "Papamoa, Tauranga", latitude: -37.717, longitude: 176.317 },
  { label: "Tauranga Central", latitude: -37.687, longitude: 176.165 },
  { label: "Auckland CBD", latitude: -36.848, longitude: 174.763 },
  { label: "Wellington", latitude: -41.286, longitude: 174.776 },
  { label: "Christchurch", latitude: -43.532, longitude: 172.636 },
];

export const RADIUS_OPTIONS_KM = [1, 5, 10, 20, 50] as const;

export async function fetchUserLocation(): Promise<UserLocation> {
  if (isMockMode()) {
    const raw = await AsyncStorage.getItem("homehub:mock_location");
    if (raw) return JSON.parse(raw) as UserLocation;
    return { preferred_location_name: null, preferred_latitude: null, preferred_longitude: null };
  }
  const { data } = await api.get<UserLocation>("/users/me/location");
  return data;
}

export async function saveUserLocation(payload: {
  preferred_location_name: string;
  preferred_latitude?: number | null;
  preferred_longitude?: number | null;
}): Promise<UserLocation> {
  if (isMockMode()) {
    const saved: UserLocation = {
      preferred_location_name: payload.preferred_location_name,
      preferred_latitude: payload.preferred_latitude ?? null,
      preferred_longitude: payload.preferred_longitude ?? null,
    };
    await AsyncStorage.setItem("homehub:mock_location", JSON.stringify(saved));
    await pushRecentLocation(payload.preferred_location_name);
    return saved;
  }
  const { data } = await api.put<UserLocation>("/users/me/location", payload);
  await pushRecentLocation(payload.preferred_location_name);
  return data;
}

export async function getRecentLocations(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(RECENT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function pushRecentLocation(name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  const recent = (await getRecentLocations()).filter((r) => r !== trimmed);
  recent.unshift(trimmed);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function matchSuggestion(query: string): LocationSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return LOCATION_SUGGESTIONS;
  return LOCATION_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(q));
}

export function coordsForLabel(label: string): { latitude: number; longitude: number } | null {
  const found = LOCATION_SUGGESTIONS.find(
    (s) => s.label.toLowerCase() === label.toLowerCase(),
  );
  if (found) return { latitude: found.latitude, longitude: found.longitude };
  const partial = LOCATION_SUGGESTIONS.find((s) =>
    s.label.toLowerCase().includes(label.toLowerCase()),
  );
  return partial ? { latitude: partial.latitude, longitude: partial.longitude } : null;
}
