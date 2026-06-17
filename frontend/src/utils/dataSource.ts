export type DataSource = "api" | "mock" | "cache";

export function isMockMode(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCK !== "false";
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
