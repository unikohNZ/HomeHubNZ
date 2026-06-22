import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { AppNotification } from "../types/flat";
import { Property } from "../types/property";
import { formatCurrency } from "../utils/format";
import { AppCard } from "./AppCard";
import { SectionHeader } from "./SectionHeader";
import { UserAvatar } from "./UserAvatar";
import { radius, spacing } from "../constants/design";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function rentStatusLabel(daysUntil: number | null): { text: string; tone: "success" | "warning" | "danger" } {
  if (daysUntil === null) return { text: "No rent scheduled", tone: "success" };
  if (daysUntil < 0) return { text: `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"}`, tone: "danger" };
  if (daysUntil === 0) return { text: "Due today", tone: "warning" };
  if (daysUntil <= 3) return { text: `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`, tone: "warning" };
  return { text: "Everything looks good today", tone: "success" };
}

export interface FlatmateDashboardProps {
  userName: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  property: Property | null;
  nextRentDate: string | null;
  nextRentAmount: number;
  rentDaysUntil: number | null;
  unreadMessages: number;
  notifications: AppNotification[];
  onMyFlat: () => void;
  onMessages: () => void;
  onMaintenance: () => void;
  onCalendar: () => void;
  onPayRent: () => void;
  onViewHistory: () => void;
}

export function FlatmateDashboard({
  userName,
  avatarUrl,
  avatarColor = "#4F86F7",
  property,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  unreadMessages,
  notifications,
  onMyFlat,
  onMessages,
  onMaintenance,
  onCalendar,
  onPayRent,
  onViewHistory,
}: FlatmateDashboardProps) {
  const { theme } = useTheme();
  const firstName = userName.split(" ")[0];
  const status = rentStatusLabel(rentDaysUntil);
  const statusColor =
    status.tone === "danger" ? theme.danger : status.tone === "warning" ? theme.warning : theme.success;

  const quickActions = [
    { label: "My Flat", icon: "🏡", onPress: onMyFlat },
    { label: "Messages", icon: "💬", onPress: onMessages, badge: unreadMessages },
    { label: "Maintenance", icon: "🔧", onPress: onMaintenance },
    { label: "Calendar", icon: "📅", onPress: onCalendar },
  ];

  const activity = notifications.slice(0, 4).map((n) => ({
    id: n.id,
    icon: n.icon,
    title: n.title,
    subtitle: n.message,
    time: n.datetime ?? "Recently",
  }));

  if (activity.length === 0) {
    activity.push(
      { id: "a1", icon: "✅", title: "Rent Paid", subtitle: "Your last payment was recorded", time: "This week" },
      { id: "a2", icon: "💬", title: "New Message", subtitle: "Check Messages for updates", time: "Today" },
    );
  }

  return (
    <>
      {/* Section 1 — Welcome */}
      <AppCard elevated style={styles.welcomeCard}>
        <View style={styles.welcomeRow}>
          <UserAvatar name={userName} color={avatarColor} size={52} imageUri={avatarUrl} />
          <View style={styles.welcomeText}>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>
              {getGreeting()}, {firstName} 👋
            </Text>
            <Text style={[styles.propertyName, { color: theme.text }]}>
              {property?.name ?? "Find your flat"}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor + "22" }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{status.text}</Text>
            </View>
          </View>
        </View>
      </AppCard>

      {/* Section 2 — Rent */}
      <AppCard elevated>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Rent</Text>
        <Text style={[styles.rentAmount, { color: theme.accent }]}>
          {formatCurrency(nextRentAmount)}
        </Text>
        <View style={styles.rentMeta}>
          <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>
            Due {nextRentDate ?? "—"}
          </Text>
          <Text style={[styles.metaStatus, { color: statusColor }]}>{status.text}</Text>
        </View>
        <View style={styles.btnRow}>
          <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={onPayRent}>
            <Text style={styles.primaryBtnText}>Pay Rent</Text>
          </Pressable>
          <Pressable style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={onViewHistory}>
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>View History</Text>
          </Pressable>
        </View>
      </AppCard>

      {/* Section 3 — Property summary */}
      {property && (
        <AppCard>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Your Property</Text>
          <Image source={{ uri: property.image_url }} style={styles.propertyImage} />
          <Text style={[styles.address, { color: theme.text }]}>{property.address}</Text>
          <Text style={[styles.suburb, { color: theme.textSecondary }]}>
            {property.suburb}, {property.city}
          </Text>
          <View style={styles.statsRow}>
            <Stat label="Lease start" value={property.lease_start ?? "—"} theme={theme.text} />
            <Stat label="Lease end" value={property.lease_end ?? "—"} theme={theme.text} />
          </View>
          <View style={styles.statsRow}>
            <Stat
              label="Occupancy"
              value={`${property.flatmate_count}/${property.max_flatmates}`}
              theme={theme.text}
            />
            <Stat label="Flatmates" value={String(property.flatmate_count)} theme={theme.text} />
          </View>
        </AppCard>
      )}

      {/* Section 4 — Quick actions (max 4) */}
      <SectionHeader title="Quick Actions" />
      <View style={styles.grid}>
        {quickActions.map((a) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && { opacity: 0.88 },
            ]}
            onPress={a.onPress}
          >
            <Text style={styles.actionIcon}>{a.icon}</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
            {"badge" in a && a.badge !== undefined && a.badge > 0 && (
              <View style={[styles.actionBadge, { backgroundColor: theme.danger }]}>
                <Text style={styles.actionBadgeText}>{a.badge > 9 ? "9+" : a.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {/* Section 5 — Recent activity */}
      <SectionHeader title="Recent Activity" />
      {activity.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.timelineRow,
            index < activity.length - 1 && styles.timelineBorder,
            { borderBottomColor: theme.border },
          ]}
        >
          <View style={[styles.timelineIcon, { backgroundColor: theme.primaryMuted }]}>
            <Text>{item.icon}</Text>
          </View>
          <View style={styles.timelineBody}>
            <Text style={[styles.timelineTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.timelineSub, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
          <Text style={[styles.timelineTime, { color: theme.textMuted }]}>{item.time}</Text>
        </View>
      ))}
    </>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statLabel, { color: "#94A3B8" }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme }]}>{value}</Text>
    </View>
  );
}

interface LandlordDashboardProps {
  monthlyIncome: number;
  propertyCount: number;
  occupancyRate: number;
  outstandingRent: number;
  maintenanceCount: number;
  pendingRequests: number;
  notifications: AppNotification[];
  nextInspectionDate: string;
  inspectionReminder: boolean;
  onProperties: () => void;
  onTenants: () => void;
  onPayments: () => void;
  onMaintenance: () => void;
  onProfile: () => void;
  onNotifications: () => void;
  onScheduleInspection: () => void;
}

export function LandlordDashboard({
  monthlyIncome,
  propertyCount,
  occupancyRate,
  outstandingRent,
  maintenanceCount,
  pendingRequests,
  notifications,
  nextInspectionDate,
  inspectionReminder,
  onProperties,
  onTenants,
  onPayments,
  onMaintenance,
  onProfile,
  onNotifications,
  onScheduleInspection,
}: LandlordDashboardProps) {
  const { theme } = useTheme();
  const landlordNotifs = notifications.slice(0, 4);

  const quickActions = [
    { label: "Properties", icon: "🏢", onPress: onProperties },
    { label: "Tenants", icon: "👥", onPress: onTenants },
    { label: "Payments", icon: "💰", onPress: onPayments },
    { label: "Maintenance", icon: "🔧", onPress: onMaintenance },
  ];

  return (
    <>
      <AppCard elevated>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Monthly Income</Text>
        <Text style={[styles.landlordIncome, { color: theme.text }]}>
          {formatCurrency(monthlyIncome)}
        </Text>
        <View style={styles.statsRow}>
          <Stat label="Outstanding" value={formatCurrency(outstandingRent)} theme={theme.warning} />
          <Stat label="Occupancy" value={`${occupancyRate}%`} theme={theme.success} />
        </View>
        <Pressable style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: spacing.md }]} onPress={onPayments}>
          <Text style={styles.primaryBtnText}>View Payments →</Text>
        </Pressable>
      </AppCard>

      <View style={styles.landlordStats}>
        <MiniStat label="Properties" value={String(propertyCount)} onPress={onProperties} />
        <MiniStat label="Maintenance" value={String(maintenanceCount)} onPress={onMaintenance} tone="danger" />
        <MiniStat label="Requests" value={String(pendingRequests)} onPress={onTenants} tone="warning" />
      </View>

      <Pressable
        style={[styles.inspectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onScheduleInspection}
      >
        <Text style={[styles.inspectionTitle, { color: theme.text }]}>Next Inspection</Text>
        <Text style={[styles.inspectionDate, { color: theme.primary }]}>{nextInspectionDate}</Text>
        {inspectionReminder && (
          <Text style={[styles.reminderText, { color: theme.warning }]}>Reminder set</Text>
        )}
      </Pressable>

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
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Recent Activity" actionLabel="See all" onAction={onNotifications} />
      {landlordNotifs.map((n) => (
        <Pressable
          key={n.id}
          style={[styles.notif, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onNotifications}
        >
          <Text style={styles.notifIcon}>{n.icon}</Text>
          <View style={styles.flex}>
            <Text style={[styles.notifTitle, { color: theme.text }]}>{n.title}</Text>
            <Text style={[styles.notifMsg, { color: theme.textMuted }]} numberOfLines={2}>
              {n.message}
            </Text>
          </View>
        </Pressable>
      ))}

      <Pressable
        style={[styles.profileLink, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onProfile}
      >
        <Text style={[styles.profileLinkText, { color: theme.primary }]}>👤 Account & Settings →</Text>
      </Pressable>
    </>
  );
}

function MiniStat({
  label,
  value,
  onPress,
  tone = "primary",
}: {
  label: string;
  value: string;
  onPress?: () => void;
  tone?: "primary" | "warning" | "danger";
}) {
  const { theme } = useTheme();
  const color =
    tone === "danger" ? theme.danger : tone === "warning" ? theme.warning : theme.primary;
  const inner = (
    <View style={[styles.miniStat, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
  if (onPress) return <Pressable style={styles.miniWrap} onPress={onPress}>{inner}</Pressable>;
  return <View style={styles.miniWrap}>{inner}</View>;
}

const styles = StyleSheet.create({
  welcomeCard: { marginBottom: 0 },
  welcomeRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  welcomeText: { flex: 1 },
  greeting: { fontSize: 13, fontWeight: "600" },
  propertyName: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  rentAmount: { fontSize: 32, fontWeight: "800", marginTop: 4 },
  rentMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  metaLabel: { fontSize: 13, fontWeight: "600" },
  metaStatus: { fontSize: 13, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: spacing.lg },
  primaryBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 14, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },
  propertyImage: { width: "100%", height: 140, borderRadius: radius.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  address: { fontSize: 16, fontWeight: "700" },
  suburb: { fontSize: 13, marginTop: 2, marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, fontWeight: "600" },
  statValue: { fontSize: 15, fontWeight: "800", marginTop: 2 },
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
  actionBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  timelineBorder: { borderBottomWidth: 1 },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineBody: { flex: 1 },
  timelineTitle: { fontSize: 14, fontWeight: "700" },
  timelineSub: { fontSize: 12, marginTop: 2 },
  timelineTime: { fontSize: 11, fontWeight: "600" },
  landlordIncome: { fontSize: 34, fontWeight: "800", marginTop: 4 },
  landlordStats: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  miniWrap: { flex: 1 },
  miniStat: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, alignItems: "center" },
  miniValue: { fontSize: 20, fontWeight: "800" },
  miniLabel: { fontSize: 10, fontWeight: "600", marginTop: 4, textAlign: "center" },
  inspectionCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  inspectionTitle: { fontSize: 13, fontWeight: "700" },
  inspectionDate: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  reminderText: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  flex: { flex: 1 },
  notif: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  notifIcon: { fontSize: 20 },
  notifTitle: { fontSize: 14, fontWeight: "700" },
  notifMsg: { fontSize: 12, marginTop: 2 },
  profileLink: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, alignItems: "center", marginTop: spacing.sm },
  profileLinkText: { fontSize: 14, fontWeight: "700" },
});
