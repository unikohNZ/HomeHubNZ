import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { ScreenShell } from "../components/ScreenShell";
import { BRAND_TAGLINE } from "../constants/branding";
import { radius, spacing } from "../constants/design";
import { useTheme } from "../context/ThemeContext";
import { DemoRole } from "../types";
import { SubScreen } from "../types/navigation";

interface MoreMenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  badge?: number;
}

interface MoreMenuSection {
  title: string;
  items: MoreMenuItem[];
}

interface MoreScreenProps {
  role: DemoRole;
  onOpenFeature: (screen: SubScreen) => void;
  onOpenMessages: () => void;
  onOpenProfile: () => void;
  onOpenTenants?: () => void;
  onOpenMaintenance?: () => void;
  onOpenProperties?: () => void;
  onOpenNotifications?: () => void;
  unreadMessages?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function MoreScreen({
  role,
  onOpenFeature,
  onOpenMessages,
  onOpenProfile,
  onOpenTenants,
  onOpenMaintenance,
  onOpenProperties,
  onOpenNotifications,
  unreadMessages = 0,
  refreshing,
  onRefresh,
}: MoreScreenProps) {
  const { theme } = useTheme();

  const flatmateSections: MoreMenuSection[] = [
    {
      title: "Communication",
      items: [
        { id: "messages", label: "Messages", icon: "💬", onPress: onOpenMessages, badge: unreadMessages },
        { id: "notifications", label: "Notifications", icon: "🔔", onPress: () => onOpenFeature("notifications") },
        { id: "announcements", label: "Announcements", icon: "📢", onPress: () => onOpenFeature("announcements") },
      ],
    },
    {
      title: "Household",
      items: [
        { id: "house-rules", label: "House Rules", icon: "📋", onPress: () => onOpenFeature("house-rules") },
        { id: "visitors", label: "Visitors", icon: "🚪", onPress: () => onOpenFeature("visitors") },
        { id: "shopping-list", label: "Shopping List", icon: "🛒", onPress: () => onOpenFeature("shopping-list") },
        { id: "chores", label: "Chores", icon: "🧹", onPress: () => onOpenFeature("chores") },
      ],
    },
    {
      title: "Money",
      items: [
        { id: "expenses", label: "Expenses", icon: "💳", onPress: () => onOpenFeature("expenses") },
        { id: "utilities", label: "Utilities", icon: "📊", onPress: () => onOpenFeature("utility-analytics") },
        { id: "bond", label: "Bond Tracker", icon: "🏦", onPress: () => onOpenFeature("bond-tracker") },
      ],
    },
    {
      title: "Property",
      items: [
        { id: "lease", label: "Lease", icon: "📅", onPress: () => onOpenFeature("lease-timeline") },
        { id: "gallery", label: "Gallery", icon: "🖼️", onPress: () => onOpenFeature("gallery") },
        { id: "maintenance-history", label: "Maintenance History", icon: "📜", onPress: () => onOpenFeature("maintenance-history") },
        { id: "inspection", label: "Inspection Reports", icon: "🔍", onPress: () => onOpenFeature("property-health") },
      ],
    },
    {
      title: "Safety",
      items: [
        { id: "emergency", label: "Emergency Information", icon: "🆘", onPress: () => onOpenFeature("emergency-hub") },
        { id: "alerts", label: "Alerts", icon: "🚨", onPress: () => onOpenFeature("alerts") },
      ],
    },
    {
      title: "Account",
      items: [
        { id: "profile", label: "Profile & Settings", icon: "👤", onPress: onOpenProfile },
        { id: "documents", label: "Documents", icon: "📄", onPress: () => onOpenFeature("documents") },
        { id: "about", label: "About HomeHub NZ", icon: "ℹ️", onPress: () => onOpenFeature("about") },
      ],
    },
  ];

  const landlordSections: MoreMenuSection[] = [
    {
      title: "Management",
      items: [
        { id: "properties", label: "Properties", icon: "🏢", onPress: () => onOpenProperties?.() },
        { id: "tenants", label: "Tenants", icon: "👥", onPress: () => onOpenTenants?.() },
        { id: "maintenance", label: "Maintenance", icon: "🔧", onPress: () => onOpenMaintenance?.() },
        { id: "messages", label: "Messages", icon: "💬", onPress: onOpenMessages, badge: unreadMessages },
      ],
    },
    {
      title: "Reports",
      items: [
        { id: "maintenance-history", label: "Maintenance History", icon: "📜", onPress: () => onOpenFeature("maintenance-history") },
        { id: "inspection", label: "Inspection Reports", icon: "🔍", onPress: () => onOpenFeature("property-health") },
        { id: "expenses", label: "Expenses", icon: "💳", onPress: () => onOpenFeature("expenses") },
      ],
    },
    {
      title: "Communication",
      items: [
        { id: "notifications", label: "Notifications", icon: "🔔", onPress: () => onOpenNotifications?.() },
        { id: "announcements", label: "Announcements", icon: "📢", onPress: () => onOpenFeature("announcements") },
      ],
    },
    {
      title: "Account",
      items: [
        { id: "profile", label: "Profile & Settings", icon: "👤", onPress: onOpenProfile },
        { id: "documents", label: "Documents", icon: "📄", onPress: () => onOpenFeature("documents") },
        { id: "emergency", label: "Emergency Information", icon: "🆘", onPress: () => onOpenFeature("emergency-hub") },
        { id: "about", label: "About HomeHub NZ", icon: "ℹ️", onPress: () => onOpenFeature("about") },
      ],
    },
  ];

  const sections = role === "landlord" ? landlordSections : flatmateSections;

  return (
    <ScreenShell title="More" subtitle="Everything else in one place" refreshing={refreshing} onRefresh={onRefresh}>
      <View style={[styles.brandCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <BrandLogo variant="light" size="small" />
        <View style={styles.brandText}>
          <Text style={[styles.brandName, { color: theme.text }]}>HomeHub NZ</Text>
          <Text style={[styles.brandTag, { color: theme.textSecondary }]}>{BRAND_TAGLINE}</Text>
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{section.title}</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {section.items.map((item, index) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.menuRow,
                  index < section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={item.onPress}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
                {item.badge !== undefined && item.badge > 0 && (
                  <View style={[styles.menuBadge, { backgroundColor: theme.danger }]}>
                    <Text style={styles.menuBadgeText}>{item.badge > 9 ? "9+" : item.badge}</Text>
                  </View>
                )}
                <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  brandText: { flex: 1 },
  brandName: { fontSize: 18, fontWeight: "800" },
  brandTag: { fontSize: 13, marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  menuCard: { borderRadius: radius.xl, borderWidth: 1, overflow: "hidden" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  menuIcon: { fontSize: 20, width: 32 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  menuBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginRight: 8,
  },
  menuBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  chevron: { fontSize: 22, fontWeight: "300" },
});
