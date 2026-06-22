import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { radius, spacing } from "../constants/design";
import { useTheme } from "../context/ThemeContext";
import { DemoRole, SubScreen, TabId } from "../types";

export interface SearchTarget {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  tab?: TabId;
  subScreen?: SubScreen;
}

const BASE_TARGETS: SearchTarget[] = [
  { id: "messages", label: "Messages", icon: "💬", keywords: ["message", "chat", "landlord", "flatmate"], tab: "messages" },
  { id: "profile", label: "Profile", icon: "👤", keywords: ["profile", "account", "settings"], tab: "profile" },
  { id: "payments", label: "Payments", icon: "💰", keywords: ["pay", "rent", "payment", "ledger"], tab: "payments" },
  { id: "ella", label: "Ella AI", icon: "🐾", keywords: ["ella", "ai", "assistant", "help"], tab: "ella" },
  { id: "maintenance", label: "Maintenance", icon: "🔧", keywords: ["maintenance", "repair", "fix"], subScreen: "maintenance" },
  { id: "house-rules", label: "House Rules", icon: "📄", keywords: ["rules", "house"], subScreen: "house-rules" },
  { id: "documents", label: "Documents", icon: "📁", keywords: ["document", "lease", "file"], subScreen: "documents" },
  { id: "emergency", label: "Emergency Contacts", icon: "🚨", keywords: ["emergency", "contact"], subScreen: "emergency" },
  { id: "notifications", label: "Notifications", icon: "🔔", keywords: ["notification", "notice", "alert"], subScreen: "notifications" },
  { id: "property-search", label: "Find Rentals", icon: "🔍", keywords: ["search", "rental", "flat", "property"], subScreen: "property-search" },
];

function roleTargets(role: DemoRole): SearchTarget[] {
  if (role === "landlord") {
    return [
      ...BASE_TARGETS,
      { id: "properties", label: "Properties", icon: "🏢", keywords: ["property", "properties", "listing"], subScreen: "properties-manage" },
      { id: "tenants", label: "Tenants", icon: "👥", keywords: ["tenant", "flatmate"], subScreen: "tenants" },
    ];
  }
  return [
    ...BASE_TARGETS,
    { id: "my-flat", label: "My Flat", icon: "🏡", keywords: ["flat", "my flat", "home"], subScreen: "my-flat" },
  ];
}

interface UniversalSearchProps {
  role: DemoRole;
  onNavigateTab: (tab: TabId) => void;
  onNavigateSub: (screen: SubScreen) => void;
}

export function UniversalSearch({ role, onNavigateTab, onNavigateSub }: UniversalSearchProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");
  const targets = useMemo(() => roleTargets(role), [role]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return targets.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q) || q.includes(k)),
    );
  }, [query, targets]);

  const handleSelect = (target: SearchTarget) => {
    setQuery("");
    if (target.tab) onNavigateTab(target.tab);
    else if (target.subScreen) onNavigateSub(target.subScreen);
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
        placeholder="Search HomeHub..."
        placeholderTextColor={theme.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      {results.length > 0 && (
        <View style={[styles.results, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {results.slice(0, 6).map((r) => (
            <Pressable
              key={r.id}
              style={[styles.row, { borderBottomColor: theme.border }]}
              onPress={() => handleSelect(r)}
            >
              <Text style={styles.rowIcon}>{r.icon}</Text>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md, zIndex: 20 },
  input: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  results: {
    marginTop: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 15, fontWeight: "600" },
});
