export type DataSource = "api" | "mock" | "cache";

/**
 * Mock mode is opt-in only (EXPO_PUBLIC_USE_MOCK=true).
 * When USE_MOCK=false or EXPO_PUBLIC_API_URL is set, the app uses the real API.
 */
export function isMockMode(): boolean {
  if (process.env.EXPO_PUBLIC_USE_MOCK === "true") return true;
  if (process.env.EXPO_PUBLIC_USE_MOCK === "false") return false;
  return !process.env.EXPO_PUBLIC_API_URL;
}

export function isApiMode(): boolean {
  return !isMockMode();
}

export interface DataResult<T> {
  data: T;
  source: DataSource;
  error?: string;
}

/** Prefer cached API data over mock when backend is unreachable. Never inject mock when API mode is on. */
export function resolveOfflineData<T>(
  cached: T | undefined,
  mock: T,
  error?: string,
): DataResult<T> {
  if (cached !== undefined) {
    return { data: cached, source: "cache", error };
  }
  if (isMockMode()) {
    return { data: mock, source: "mock", error };
  }
  const empty = Array.isArray(mock) ? ([] as T) : mock;
  return {
    data: empty,
    source: "cache",
    error: error ?? "Backend unavailable",
  };
}
