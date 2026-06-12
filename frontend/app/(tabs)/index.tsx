import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  AppCard,
  Avatar,
  Badge,
  LoadingSpinner,
  StatCard,
} from "@/components";
import { useAuth } from "@/context/AuthContext";
import {
  useMaintenance,
  useProperties,
  useRentPayments,
} from "@/hooks/useHomeHubData";
import { buildDashboardStats, MOCK_ACTIVITY } from "@/data/mockData";
import { colors, radius, spacing } from "@/constants/theme";
import { formatCurrency, initials } from "@/utils/format";
import { ActivityItem } from "@/types";

const QUICK_ACTIONS = [
  { label: "Add Property", icon: "add-circle", color: colors.primary, href: "/add-property" },
  { label: "Pay Rent", icon: "card", color: colors.success, href: "/add-payment" },
  { label: "Report Issue", icon: "construct", color: colors.warning, href: "/add-maintenance" },
  { label: "Message", icon: "chatbubble-ellipses", color: colors.purple, href: "/(tabs)/messages" },
] as const;

const ACTIVITY_ICONS: Record<ActivityItem["type"], keyof typeof Ionicons.glyphMap> = {
  rent: "wallet",
  maintenance: "construct",
  message: "chatbubble-ellipses",
  inspection: "clipboard",
  property: "home",
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  rent: colors.success,
  maintenance: colors.warning,
  message: colors.primary,
  inspection: colors.purple,
  property: colors.teal,
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data: properties, isLoading: pLoading } = useProperties();
  const { data: payments, isLoading: rLoading } = useRentPayments();
  const { data: maintenance, isLoading: mLoading } = useMaintenance();

  const stats = useMemo(
    () =>
      buildDashboardStats(
        properties ?? [],
        payments ?? [],
        maintenance ?? [],
        3,
      ),
    [properties, payments, maintenance],
  );

  if (pLoading || rLoading || mLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LoadingSpinner fullScreen message="Loading your dashboard..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar
              label={initials(user?.first_name ?? "U", user?.last_name)}
              size={48}
            />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.name}>
                Kia ora, {user?.first_name ?? "there"}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.bell}
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        <AppCard elevated style={styles.rentCard}>
          <View style={styles.rentTop}>
            <View>
              <Text style={styles.rentLabel}>Rent Due</Text>
              <Text style={styles.rentValue}>
                {formatCurrency(stats.rent_due)}
              </Text>
              <Text style={styles.rentSub}>{stats.rent_due_label}</Text>
            </View>
            <Badge label="On track" bg={colors.successMuted} text={colors.successText} />
          </View>
          <Pressable
            style={styles.payBtn}
            onPress={() => router.push("/add-payment")}
          >
            <Text style={styles.payBtnText}>Record Payment</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </Pressable>
        </AppCard>

        <View style={styles.statsGrid}>
          <StatCard
            label="Properties"
            value={String(stats.active_properties)}
            icon="home"
            color={colors.primary}
            subtitle="Active"
            onPress={() => router.push("/(tabs)/properties")}
          />
          <StatCard
            label="Maintenance"
            value={String(stats.open_maintenance)}
            icon="construct"
            color={colors.warning}
            subtitle="Open requests"
            badge={stats.open_maintenance > 0}
            onPress={() => router.push("/maintenance")}
          />
          <StatCard
            label="Messages"
            value={String(stats.unread_messages)}
            icon="chatbubbles"
            color={colors.purple}
            subtitle="Unread"
            onPress={() => router.push("/(tabs)/messages")}
          />
          <StatCard
            label="Monthly Income"
            value={formatCurrency(stats.monthly_income)}
            icon="trending-up"
            color={colors.success}
            trend="+4.2%"
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(action.href)}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: action.color + "22" },
                ]}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <AppCard padded={false} style={styles.activityCard}>
          {MOCK_ACTIVITY.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.activityItem,
                index < MOCK_ACTIVITY.length - 1 && styles.activityBorder,
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { backgroundColor: ACTIVITY_COLORS[item.type] + "22" },
                ]}
              >
                <Ionicons
                  name={ACTIVITY_ICONS[item.type]}
                  size={18}
                  color={ACTIVITY_COLORS[item.type]}
                />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activitySub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  headerText: {},
  greeting: { color: colors.textMuted, fontSize: 13 },
  name: { color: colors.text, fontSize: 20, fontWeight: "800", marginTop: 2 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  rentCard: { marginTop: spacing.sm, marginBottom: spacing.lg },
  rentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  rentLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  rentValue: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  rentSub: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  payBtnText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  actionLabel: { color: colors.text, fontSize: 14, fontWeight: "600" },
  activityCard: { marginBottom: spacing.lg },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  activityText: { flex: 1 },
  activityTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  activitySub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  activityTime: { color: colors.textFaint, fontSize: 11 },
});
