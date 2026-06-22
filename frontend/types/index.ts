export type DemoRole = "flatmate" | "landlord";

/** Main bottom navigation — same for all roles */
export type TabId = "home" | "messages" | "ella" | "payments" | "profile";

/** @deprecated Legacy tab ids — mapped in navigateTab */
export type LegacyTabId =
  | "rent"
  | "myflat"
  | "properties"
  | "more"
  | "tenants"
  | "maintenance";

export * from "./navigation";
export * from "./property";
export * from "./user";
export * from "./rent";
export * from "./request";
export * from "./message";
export * from "./flat";
export * from "./flatExtended";
