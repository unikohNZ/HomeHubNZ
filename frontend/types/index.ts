export type DemoRole = "flatmate" | "landlord";

export type FlatmateTabId = "home" | "myflat" | "rent" | "messages" | "profile";
export type LandlordTabId = "home" | "properties" | "requests" | "rent" | "profile";
export type TabId = FlatmateTabId | LandlordTabId;

export * from "./navigation";
export * from "./property";
export * from "./user";
export * from "./rent";
export * from "./request";
export * from "./message";
export * from "./flat";
export * from "./flatExtended";
