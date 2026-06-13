import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { DemoRole, TabId } from "../types";

const FLATMATE_TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "myflat", label: "My Flat", icon: "🛏️" },
  { id: "rent", label: "Rent", icon: "💰" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const LANDLORD_TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "properties", label: "Properties", icon: "🏢" },
  { id: "requests", label: "Requests", icon: "📋" },
  { id: "rent", label: "Rent", icon: "💰" },
  { id: "profile", label: "Profile", icon: "👤" },
];

interface BottomNavigationProps {
  role: DemoRole;
  active: TabId;
  onChange: (tab: TabId) => void;
  unreadMessages?: number;
}

export function BottomNavigation({
  role,
  active,
  onChange,
  unreadMessages = 0,
}: BottomNavigationProps) {
  const { theme } = useTheme();
  const tabs = role === "landlord" ? LANDLORD_TABS : FLATMATE_TABS;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const showBadge = tab.id === "messages" && unreadMessages > 0;
        return (
          <Pressable key={tab.id} style={styles.tab} onPress={() => onChange(tab.id)}>
            {isActive && (
              <View style={[styles.indicator, { backgroundColor: theme.primary }]} />
            )}
            <View style={styles.iconWrap}>
              <Text style={[styles.icon, { opacity: isActive ? 1 : 0.45 }]}>{tab.icon}</Text>
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? theme.primary : theme.textMuted },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 4, position: "relative" },
  indicator: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  iconWrap: { position: "relative", marginBottom: 2 },
  icon: { fontSize: 20 },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  label: { fontSize: 10, fontWeight: "600" },
});
