import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { DemoRole, TabId } from "../types";
import { radius, spacing, touchTarget } from "../constants/design";

const FLATMATE_TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "myflat", label: "My Flat", icon: "🛏️" },
  { id: "rent", label: "Rent", icon: "💰" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const LANDLORD_TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Dashboard", icon: "📊" },
  { id: "properties", label: "Properties", icon: "🏢" },
  { id: "tenants", label: "Tenants", icon: "👥" },
  { id: "payments", label: "Payments", icon: "💳" },
  { id: "maintenance", label: "Maintenance", icon: "🔧" },
];

interface BottomNavigationProps {
  role: DemoRole;
  active: TabId;
  onChange: (tab: TabId) => void;
  unreadMessages?: number;
  unreadNotifications?: number;
}

export function BottomNavigation({
  role,
  active,
  onChange,
  unreadMessages = 0,
  unreadNotifications = 0,
}: BottomNavigationProps) {
  const { theme } = useTheme();
  const tabs = role === "landlord" ? LANDLORD_TABS : FLATMATE_TABS;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === "ios" ? 26 : 14,
          ...(Platform.OS !== "web" && {
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 12,
          }),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const badge =
          tab.id === "messages"
            ? unreadMessages
            : tab.id === "home" && role === "flatmate"
              ? unreadNotifications
              : 0;

        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => onChange(tab.id)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            {isActive && (
              <View style={[styles.indicator, { backgroundColor: theme.accent }]} />
            )}
            <View
              style={[
                styles.iconBubble,
                isActive && { backgroundColor: theme.primaryMuted },
              ]}
            >
              <Text style={[styles.icon, { opacity: isActive ? 1 : 0.5 }]}>{tab.icon}</Text>
              {badge > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
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
  bar: { flexDirection: "row", borderTopWidth: 1, paddingTop: spacing.sm },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
    minHeight: touchTarget + 8,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  iconBubble: {
    width: 40,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    position: "relative",
  },
  icon: { fontSize: 20 },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  label: { fontSize: 10, fontWeight: "700" },
});
