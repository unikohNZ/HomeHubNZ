import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MOCK_UPCOMING_EVENTS } from "../data/mockAlerts";
import { AppNotification } from "../types/flat";
import { formatCurrency } from "../utils/format";
import { AppCard } from "./AppCard";
import { AlertStatusBanner, AlertLevel } from "./ui/AlertStatusBanner";
import { SectionHeader } from "./SectionHeader";
import { radius, spacing } from "../constants/design";

interface FlatmateDashboardProps {
  rentDue: number;
  nextRentDate: string | null;
  nextRentAmount: number;
  rentDaysUntil: number | null;
  flatName: string | null;
  alertLevel: AlertLevel;
  alertTitle: string;
  unreadMessages: number;
  choresPending: number;
  notifications: AppNotification[];
  onMyFlat: () => void;
  onRent: () => void;
  onMessages: () => void;
  onEmergency: () => void;
  onCalendar: () => void;
  onAlerts: () => void;
  onNotifications: () => void;
}

export function FlatmateDashboard({
  rentDue,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  flatName,
  alertLevel,
  alertTitle,
  unreadMessages,
  choresPending,
  notifications,
  onMyFlat,
  onRent,
  onMessages,
  onEmergency,
  onCalendar,
  onAlerts,
  onNotifications,
}: FlatmateDashboardProps) {
  const { theme } = useTheme();
  const preview = notifications.filter((n) => !n.read).slice(0, 2);
  const hasEmergency = alertLevel === "emergency" || alertLevel === "watch";

  const priorityLines: string[] = [];
  if (rentDaysUntil !== null) {
    if (rentDaysUntil === 0) priorityLines.push("Rent due today");
    else if (rentDaysUntil > 0) priorityLines.push(`Rent due in ${rentDaysUntil} day${rentDaysUntil === 1 ? "" : "s"}`);
    else priorityLines.push(`Rent overdue by ${Math.abs(rentDaysUntil)} day${Math.abs(rentDaysUntil) === 1 ? "" : "s"}`);
  }
  if (choresPending > 0) {
    priorityLines.push(`${choresPending} chore${choresPending === 1 ? "" : "s"} pending`);
  }
  if (unreadMessages > 0) {
    priorityLines.push(`${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`);
  }
  priorityLines.push(hasEmergency ? "Emergency alert active" : "No emergency alerts");

  const quickActions = [
    { label: "My Flat", icon: "🏠", onPress: onMyFlat },
    { label: "Rent", icon: "💰", onPress: onRent },
    { label: "Messages", icon: "💬", onPress: onMessages },
    { label: "Emergency", icon: "🚨", onPress: onEmergency },
  ];

  return (
    <>
      <AppCard elevated style={{ borderColor: theme.primary + "44" }}>
        <Text style={[styles.flatLabel, { color: theme.textMuted }]}>Current Flat</Text>
        <Text style={[styles.flatName, { color: theme.text }]}>
          {flatName ?? "Not joined yet"}
        </Text>
        <View style={styles.rentRow}>
          <View>
            <Text style={[styles.rentLabel, { color: theme.textMuted }]}>Next Rent Due</Text>
            <Text style={[styles.rentValue, { color: theme.accent }]}>
              {formatCurrency(nextRentAmount || rentDue)}
            </Text>
          </View>
          <View style={styles.dueCol}>
            <Text style={[styles.rentLabel, { color: theme.textMuted }]}>Due</Text>
            <Text style={[styles.dueDate, { color: theme.text }]}>
              {nextRentDate ?? "—"}
            </Text>
          </View>
        </View>
        <Pressable style={[styles.cta, { backgroundColor: theme.primary }]} onPress={onRent}>
          <Text style={styles.ctaText}>View Rent Tracker →</Text>
        </Pressable>
      </AppCard>

      <AlertStatusBanner
        level={alertLevel}
        title={alertTitle}
        subtitle="Tap for Civil Defence alerts & guides"
        onPress={onAlerts}
      />

      <SectionHeader title="Today's Priorities" />
      <AppCard>
        {priorityLines.map((line) => (
          <View key={line} style={styles.priorityRow}>
            <Text style={styles.priorityDot}>•</Text>
            <Text style={[styles.priorityText, { color: theme.text }]}>{line}</Text>
          </View>
        ))}
      </AppCard>

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
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Upcoming Events" actionLabel="Calendar" onAction={onCalendar} />
      {MOCK_UPCOMING_EVENTS.slice(0, 2).map((ev) => (
        <Pressable
          key={ev.id}
          style={[styles.event, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onCalendar}
        >
          <Text style={styles.eventIcon}>{ev.icon}</Text>
          <View style={styles.flex}>
            <Text style={[styles.eventTitle, { color: theme.text }]}>{ev.title}</Text>
            <Text style={[styles.eventDate, { color: theme.textMuted }]}>{ev.date}</Text>
          </View>
        </Pressable>
      ))}

      <SectionHeader title="Notifications" actionLabel="See all" onAction={onNotifications} />
      {preview.length === 0 ? (
        <AppCard padded style={{ alignItems: "center" }}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>All caught up 🎉</Text>
        </AppCard>
      ) : (
        preview.map((n) => (
          <Pressable
            key={n.id}
            style={[styles.notif, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onNotifications}
          >
            <Text style={styles.notifIcon}>{n.icon}</Text>
            <View style={styles.flex}>
              <Text style={[styles.notifTitle, { color: theme.text }]}>{n.title}</Text>
              <Text style={[styles.notifMsg, { color: theme.textMuted }]} numberOfLines={1}>
                {n.message}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </>
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

  return (
    <>
      <AppCard elevated>
        <Text style={[styles.landlordPortal, { color: theme.textSecondary }]}>Landlord Portal</Text>
        <Text style={[styles.landlordIncome, { color: theme.text }]}>
          {formatCurrency(monthlyIncome)}
        </Text>
        <Text style={[styles.landlordSub, { color: theme.textMuted }]}>Monthly Income</Text>
        <Pressable style={[styles.cta, { backgroundColor: theme.primary }]} onPress={onProperties}>
          <Text style={styles.ctaText}>Manage Properties →</Text>
        </Pressable>
      </AppCard>

      <View style={styles.statsGrid}>
        <StatTile label="Occupancy" value={`${occupancyRate}%`} tone="success" onPress={onTenants} />
        <StatTile label="Outstanding" value={formatCurrency(outstandingRent)} tone="warning" onPress={onPayments} />
        <StatTile label="Maintenance" value={String(maintenanceCount)} tone="danger" onPress={onMaintenance} />
        <StatTile label="Properties" value={String(propertyCount)} tone="primary" onPress={onProperties} />
      </View>

      <Pressable
        style={[styles.inspectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onScheduleInspection}
      >
        <View style={styles.inspectionRow}>
          <View style={styles.flex}>
            <Text style={[styles.inspectionTitle, { color: theme.text }]}>Next Inspection</Text>
            <Text style={[styles.inspectionDate, { color: theme.primary }]}>{nextInspectionDate}</Text>
          </View>
          {inspectionReminder && (
            <View style={[styles.reminderBadge, { backgroundColor: theme.warningMuted }]}>
              <Text style={[styles.reminderText, { color: theme.warning }]}>Reminder</Text>
            </View>
          )}
        </View>
        <Text style={[styles.inspectionAction, { color: theme.textSecondary }]}>
          Tap to schedule inspection →
        </Text>
      </Pressable>

      {pendingRequests > 0 && (
        <Pressable
          style={[styles.alertCard, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}
          onPress={onTenants}
        >
          <Text style={[styles.alertTitle, { color: theme.text }]}>
            {pendingRequests} pending join request{pendingRequests > 1 ? "s" : ""}
          </Text>
          <Text style={[styles.alertSub, { color: theme.textSecondary }]}>
            Review and approve new flatmates →
          </Text>
        </Pressable>
      )}

      <SectionHeader title="Notifications" />
      {landlordNotifs.map((n) => (
        <Pressable
          key={n.id}
          style={[
            styles.notif,
            {
              backgroundColor: n.read ? theme.card : theme.primaryMuted,
              borderColor: n.read ? theme.border : theme.primary,
            },
          ]}
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
        <Text style={[styles.profileLinkText, { color: theme.primary }]}>
          👤 Account & Settings →
        </Text>
      </Pressable>
    </>
  );
}

function StatTile({
  label,
  value,
  tone,
  onPress,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "danger";
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const colors = {
    primary: theme.primary,
    success: theme.success,
    warning: theme.warning,
    danger: theme.danger,
  }[tone];

  const inner = (
    <View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: colors }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );

  if (onPress) return <Pressable style={{ width: "47%", flexGrow: 1 }} onPress={onPress}>{inner}</Pressable>;
  return <View style={{ width: "47%", flexGrow: 1 }}>{inner}</View>;
}

const styles = StyleSheet.create({
  flatLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  flatName: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  rentRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg },
  rentLabel: { fontSize: 12, fontWeight: "600" },
  rentValue: { fontSize: 28, fontWeight: "800", marginTop: 2 },
  dueCol: { alignItems: "flex-end" },
  dueDate: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  cta: { borderRadius: radius.lg, paddingVertical: 14, alignItems: "center", marginTop: spacing.lg },
  ctaText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  priorityRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: 6 },
  priorityDot: { fontSize: 16, lineHeight: 20, color: "#4F8CFF" },
  priorityText: { fontSize: 14, fontWeight: "600", flex: 1, lineHeight: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.sm },
  action: {
    width: "47%",
    flexGrow: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
    minHeight: 88,
    justifyContent: "center",
  },
  actionIcon: { fontSize: 24, marginBottom: spacing.sm },
  actionLabel: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  flex: { flex: 1 },
  event: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  eventIcon: { fontSize: 22 },
  eventTitle: { fontSize: 15, fontWeight: "700" },
  eventDate: { fontSize: 12, marginTop: 2 },
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
  emptyText: { fontSize: 14, fontWeight: "600" },
  landlordPortal: { fontSize: 14, fontWeight: "700" },
  landlordIncome: { fontSize: 36, fontWeight: "800", marginTop: 4 },
  landlordSub: { fontSize: 13, marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.md },
  stat: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  alertCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  alertTitle: { fontSize: 15, fontWeight: "800" },
  alertSub: { fontSize: 13, marginTop: 4 },
  profileLink: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, alignItems: "center" },
  profileLinkText: { fontSize: 14, fontWeight: "700" },
  inspectionCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  inspectionRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  inspectionTitle: { fontSize: 13, fontWeight: "700" },
  inspectionDate: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  inspectionAction: { fontSize: 13, marginTop: spacing.sm },
  reminderBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  reminderText: { fontSize: 11, fontWeight: "700" },
});
