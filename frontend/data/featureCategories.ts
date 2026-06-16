import { SubScreen } from "../types/navigation";

export type FeatureTabId = "rent" | "messages";

export type FeatureItem =
  | { type: "screen"; id: SubScreen; label: string; icon: string }
  | { type: "tab"; id: FeatureTabId; label: string; icon: string };

export interface FeatureCategoryDef {
  id: string;
  title: string;
  icon: string;
  defaultExpanded: boolean;
  items: FeatureItem[];
}

export const FEATURE_CATEGORIES: FeatureCategoryDef[] = [
  {
    id: "household",
    title: "Household",
    icon: "🏠",
    defaultExpanded: true,
    items: [
      { type: "screen", id: "flatmates", label: "Flatmates", icon: "👥" },
      { type: "screen", id: "house-rules", label: "House Rules", icon: "📋" },
      { type: "screen", id: "chores", label: "Chores", icon: "🧹" },
      { type: "screen", id: "shopping-list", label: "Shopping List", icon: "🛒" },
      { type: "screen", id: "availability", label: "Availability", icon: "🏠" },
    ],
  },
  {
    id: "money",
    title: "Money",
    icon: "💰",
    defaultExpanded: true,
    items: [
      { type: "tab", id: "rent", label: "Rent", icon: "💰" },
      { type: "screen", id: "bills", label: "Bills", icon: "💡" },
      { type: "screen", id: "expenses", label: "Expenses", icon: "💳" },
      { type: "screen", id: "bond-tracker", label: "Bond", icon: "🏦" },
      { type: "screen", id: "utility-analytics", label: "Utilities", icon: "📊" },
    ],
  },
  {
    id: "property",
    title: "Property",
    icon: "🏢",
    defaultExpanded: false,
    items: [
      { type: "screen", id: "documents", label: "Documents", icon: "📄" },
      { type: "screen", id: "lease-timeline", label: "Lease", icon: "📅" },
      { type: "screen", id: "gallery", label: "Gallery", icon: "🖼️" },
      { type: "screen", id: "maintenance", label: "Maintenance", icon: "🔧" },
      { type: "screen", id: "maintenance-history", label: "History", icon: "📜" },
    ],
  },
  {
    id: "safety",
    title: "Safety",
    icon: "🛡️",
    defaultExpanded: false,
    items: [
      { type: "screen", id: "emergency", label: "Emergency", icon: "🆘" },
      { type: "screen", id: "emergency-hub", label: "Emergency Contacts", icon: "📞" },
      { type: "screen", id: "alerts", label: "Alerts", icon: "🚨" },
      { type: "screen", id: "checklists", label: "Checklist", icon: "✅" },
    ],
  },
  {
    id: "smart-tools",
    title: "Smart Tools",
    icon: "✨",
    defaultExpanded: false,
    items: [
      { type: "screen", id: "ai-assistant", label: "AI Assistant", icon: "🤖" },
      { type: "screen", id: "property-health", label: "Property Health", icon: "💚" },
      { type: "screen", id: "flat-feed", label: "Flat Feed", icon: "📰" },
      { type: "screen", id: "announcements", label: "Announcements", icon: "📢" },
      { type: "screen", id: "house-vibe", label: "House Vibe", icon: "⭐" },
    ],
  },
];

export const DEFAULT_FAVORITE_KEYS = [
  "tab:rent",
  "screen:house-rules",
  "tab:messages",
  "screen:emergency",
] as const;

export function featureKey(item: FeatureItem): string {
  return item.type === "tab" ? `tab:${item.id}` : `screen:${item.id}`;
}

export function findFeatureByKey(key: string): FeatureItem | undefined {
  for (const category of FEATURE_CATEGORIES) {
    for (const item of category.items) {
      if (featureKey(item) === key) return item;
    }
  }
  return undefined;
}

export const ALL_FEATURE_ITEMS: FeatureItem[] = FEATURE_CATEGORIES.flatMap((c) => c.items);
