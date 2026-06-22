import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ELLA_ASSETS } from "../constants/branding";
import { radius, spacing } from "../constants/design";
import { useTheme } from "../context/ThemeContext";
import { ELLA_PAGE } from "../src/constants/ellaTheme";
import { AppNotification } from "../types/flat";
import { Property } from "../types/property";
import { formatCurrency } from "../utils/format";
import { AppCard } from "./AppCard";
import { SectionHeader } from "./SectionHeader";

function rentStatusLabel(daysUntil: number | null): { text: string; tone: "success" | "warning" | "danger" } {
  if (daysUntil === null) return { text: "No rent scheduled", tone: "success" };
  if (daysUntil < 0) return { text: `Overdue ${Math.abs(daysUntil)}d`, tone: "danger" };
  if (daysUntil === 0) return { text: "Due today", tone: "warning" };
  if (daysUntil <= 3) return { text: `Due in ${daysUntil}d`, tone: "warning" };
  return { text: "On track", tone: "success" };
}

export interface FlatmateDashboardProps {
  property: Property | null;
  nextRentDate: string | null;
  nextRentAmount: number;
  rentDaysUntil: number | null;
  unreadMessages: number;
  notifications: AppNotification[];
  onMyFlat: () => void;
  onMessages: () => void;
  onMaintenance: () => void;
  onPayRent: () => void;
  onAskElla: () => void;
}

export function FlatmateDashboard({
  property,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  unreadMessages,
  notifications,
  onMyFlat,
  onMessages,
  onMaintenance,
  onPayRent,
  onAskElla,
}: FlatmateDashboardProps) {
  const { theme } = useTheme();
  const status = rentStatusLabel(rentDaysUntil);
  const statusColor =
    status.tone === "danger" ? theme.danger : status.tone === "warning" ? theme.warning : theme.success;

  const quickActions = [
    { label: "My Flat", icon: "🏡", onPress: onMyFlat },
    { label: "Pay Rent", icon: "💰", onPress: onPayRent },
    { label: "Messages", icon: "💬", onPress: onMessages, badge: unreadMessages },
    { label: "Maintenance", icon: "🔧", onPress: onMaintenance },
  ];

  const activity = notifications.slice(0, 3).map((n) => ({
    id: n.id,
    icon: n.icon,
    title: n.title,
    time: n.datetime ?? "Recently",
  }));

  return (
    <>
      <AppCard elevated>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Current Flat</Text>
        <Text style={[styles.title, { color: theme.text }]}>{property?.name ?? "No flat linked yet"}</Text>
        {property ? (
          <Text style={[styles.sub, { color: theme.textSecondary }]}>
            {property.address}, {property.suburb}
          </Text>
        ) : (
          <Text style={[styles.sub, { color: theme.textSecondary }]}>Browse rentals to find your next flat</Text>
        )}
        <View style={styles.rentRow}>
          <View>
            <Text style={[styles.meta, { color: theme.textMuted }]}>Rent due</Text>
            <Text style={[styles.amount, { color: theme.accent }]}>{formatCurrency(nextRentAmount)}</Text>
          </View>
          <View style={styles.alignEnd}>
            <Text style={[styles.meta, { color: theme.textMuted }]}>Due date</Text>
            <Text style={[styles.date, { color: theme.text }]}>{nextRentDate ?? "—"}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor + "22" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{status.text}</Text>
        </View>
        <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={onMyFlat}>
          <Text style={styles.primaryBtnText}>View My Flat</Text>
        </Pressable>
      </AppCard>

      <SectionHeader title="Quick Actions" />
      <View style={styles.grid}>
        {quickActions.map((a) => (
          <Pressable
            key={a.label}
            style={[styles.action, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={a.onPress}
          >
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
            {"badge" in a && (a.badge ?? 0) > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>{a.badge! > 9 ? "9+" : a.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.ellaCard, { backgroundColor: ELLA_PAGE.card, borderColor: ELLA_PAGE.purple + "33" }]}
        onPress={onAskElla}
      >
        <Image source={ELLA_ASSETS.happy} style={styles.ellaImg} />
        <View style={styles.ellaBody}>
          <Text style={[styles.ellaTitle, { color: theme.text }]}>Need a paw with your flat?</Text>
          <Text style={[styles.ellaSub, { color: theme.textSecondary }]}>Ask Ella anything about rent, rules, or maintenance.</Text>
          <View style={[styles.ellaBtn, { backgroundColor: ELLA_PAGE.purple }]}>
            <Text style={styles.ellaBtnText}>Ask Ella</Text>
          </View>
        </View>
      </Pressable>

      <SectionHeader title="Recent Activity" />
      {(activity.length ? activity : [{ id: "ok", icon: "✨", title: "All good at your flat", time: "Just now" }]).map(
        (item) => (
          <View key={item.id} style={[styles.activity, { borderBottomColor: theme.border }]}>
            <Text style={styles.activityIcon}>{item.icon}</Text>
            <Text style={[styles.activityTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.activityTime, { color: theme.textMuted }]}>{item.time}</Text>
          </View>
        ),
      )}
    </>
  );
}

export interface LandlordDashboardProps {
  monthlyIncome: number;
  collectedThisMonth: number;
  outstandingRent: number;
  occupancyRate: number;
  propertyCount: number;
  locationSummary: string[];
  overdueCount: number;
  pendingJoinRequests: number;
  maintenanceCount: number;
  notifications: AppNotification[];
  onPayments: () => void;
  onProperties: () => void;
  onTenants: () => void;
  onMessages: () => void;
  onMaintenance: () => void;
  unreadMessages: number;
}

export function LandlordDashboard({
  monthlyIncome,
  collectedThisMonth,
  outstandingRent,
  occupancyRate,
  propertyCount,
  locationSummary,
  overdueCount,
  pendingJoinRequests,
  maintenanceCount,
  notifications,
  onPayments,
  onProperties,
  onTenants,
  onMessages,
  onMaintenance,
  unreadMessages,
}: LandlordDashboardProps) {
  const { theme } = useTheme();

  const quickActions = [
    { label: "Properties", icon: "🏢", onPress: onProperties },
    { label: "Tenants", icon: "👥", onPress: onTenants },
    { label: "Messages", icon: "💬", onPress: onMessages, badge: unreadMessages },
    { label: "Maintenance", icon: "🔧", onPress: onMaintenance },
  ];

  const needsAttention: { icon: string; text: string }[] = [];
  if (overdueCount > 0) needsAttention.push({ icon: "⚠️", text: `${overdueCount} overdue rent payment${overdueCount === 1 ? "" : "s"}` });
  if (pendingJoinRequests > 0) needsAttention.push({ icon: "👥", text: `${pendingJoinRequests} pending join request${pendingJoinRequests === 1 ? "" : "s"}` });
  if (maintenanceCount > 0) needsAttention.push({ icon: "🔧", text: `${maintenanceCount} maintenance request${maintenanceCount === 1 ? "" : "s"}` });

  const activity = notifications.slice(0, 3);

  return (
    <>
      <AppCard elevated>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Portfolio Summary</Text>
        <View style={styles.statsGrid}>
          <Stat label="Monthly income" value={formatCurrency(monthlyIncome)} color={theme.text} />
          <Stat label="Collected" value={formatCurrency(collectedThisMonth)} color={theme.success} />
          <Stat label="Outstanding" value={formatCurrency(outstandingRent)} color={theme.warning} />
          <Stat label="Occupancy" value={`${occupancyRate}%`} color={theme.primary} />
        </View>
        <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={onPayments}>
          <Text style={styles.primaryBtnText}>View Payments</Text>
        </Pressable>
      </AppCard>

      <AppCard>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Properties by location</Text>
        <Text style={[styles.locations, { color: theme.text }]}>
          {locationSummary.length ? locationSummary.join(" · ") : "No properties yet"}
        </Text>
        <Text style={[styles.sub, { color: theme.textSecondary, marginTop: 4 }]}>
          {propertyCount} propert{propertyCount === 1 ? "y" : "ies"} managed
        </Text>
        <Pressable style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={onProperties}>
          <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>View properties</Text>
        </Pressable>
      </AppCard>

      <SectionHeader title="Quick Actions" />
      <View style={styles.grid}>
        {quickActions.map((a) => (
          <Pressable
            key={a.label}
            style={[styles.action, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={a.onPress}
          >
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
            {"badge" in a && (a.badge ?? 0) > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>{a.badge! > 9 ? "9+" : a.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <AppCard>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Needs Attention</Text>
        {needsAttention.length === 0 ? (
          <Text style={[styles.sub, { color: theme.success }]}>✨ Nothing urgent right now</Text>
        ) : (
          needsAttention.map((n) => (
            <View key={n.text} style={styles.needRow}>
              <Text>{n.icon}</Text>
              <Text style={[styles.needText, { color: theme.text }]}>{n.text}</Text>
            </View>
          ))
        )}
      </AppCard>

      <SectionHeader title="Recent Activity" />
      {(activity.length ? activity : [{ id: "ok", icon: "✨", title: "Portfolio looking healthy", message: "", datetime: "Just now" } as AppNotification]).map(
        (n) => (
          <View key={n.id} style={[styles.activity, { borderBottomColor: theme.border }]}>
            <Text style={styles.activityIcon}>{n.icon}</Text>
            <Text style={[styles.activityTitle, { color: theme.text }]}>{n.title}</Text>
            <Text style={[styles.activityTime, { color: theme.textMuted }]}>{n.datetime ?? "Recently"}</Text>
          </View>
        ),
      )}
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  sub: { fontSize: 14, marginTop: 4 },
  rentRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg },
  meta: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  amount: { fontSize: 26, fontWeight: "800", marginTop: 2 },
  date: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  alignEnd: { alignItems: "flex-end" },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { fontSize: 12, fontWeight: "700" },
  primaryBtn: { borderRadius: radius.lg, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: spacing.md,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.sm },
  action: {
    width: "47%",
    flexGrow: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
    minHeight: 92,
    justifyContent: "center",
    position: "relative",
  },
  actionIcon: { fontSize: 26, marginBottom: spacing.sm },
  actionLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  ellaCard: {
    flexDirection: "row",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
    alignItems: "center",
  },
  ellaImg: { width: 64, height: 64, borderRadius: 32 },
  ellaBody: { flex: 1 },
  ellaTitle: { fontSize: 16, fontWeight: "800" },
  ellaSub: { fontSize: 13, marginTop: 4 },
  ellaBtn: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  ellaBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  activity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityIcon: { fontSize: 18 },
  activityTitle: { flex: 1, fontSize: 14, fontWeight: "600" },
  activityTime: { fontSize: 11, fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.sm },
  stat: { width: "46%", flexGrow: 1 },
  statLabel: { fontSize: 11, fontWeight: "600", color: "#94A3B8" },
  statValue: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  locations: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  needRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 8 },
  needText: { fontSize: 14, fontWeight: "600" },
});
