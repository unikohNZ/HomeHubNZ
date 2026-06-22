export type DemoRole = "flatmate" | "landlord";

export type FlatmateTabId = "home" | "myflat" | "ella" | "payments" | "more";
export type LandlordTabId = "home" | "properties" | "ella" | "payments" | "more";
export type TabId = FlatmateTabId | LandlordTabId;

/** @deprecated Use TabId — kept for internal navigation helpers */
export type LegacyTabId = "rent" | "messages" | "profile" | "tenants" | "maintenance";

export * from "./navigation";
export * from "./property";
export * from "./user";
export * from "./rent";
export * from "./request";
export * from "./message";
export * from "./flat";
export * from "./flatExtended";
