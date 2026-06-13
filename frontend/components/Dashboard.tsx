import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/format";
import { Card } from "./Card";

interface FlatmateDashboardProps {
  rentDue: number;
  nextRentDate: string | null;
  flatName: string | null;
  maintenanceCount: number;
  unreadMessages: number;
  upcomingBills: number;
  onMyFlat: () => void;
  onRent: () => void;
  onMessages: () => void;
}

export function FlatmateDashboard({
  rentDue,
  nextRentDate,
  flatName,
  maintenanceCount,
  unreadMessages,
  upcomingBills,
  onMyFlat,
  onRent,
  onMessages,
}: FlatmateDashboardProps) {
  const { theme } = useTheme();

  return (
    <>
      <Card elevated>
        <View style={styles.featureTop}>
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>My Rent Due</Text>
            <Text style={[styles.value, { color: theme.text }]}>{formatCurrency(rentDue)}</Text>
            <Text style={[styles.sub, { color: theme.textMuted }]}>
              {nextRentDate ? `Next due ${nextRentDate}` : "No upcoming rent"}
            </Text>
          </View>
          <View
            style={[
              styles.pill,
              {
                backgroundColor:
                  rentDue > 0 ? theme.warningMuted : theme.successMuted,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                { color: rentDue > 0 ? theme.warning : theme.success },
              ]}
            >
              {rentDue > 0 ? "Action needed" : "On track"}
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={onRent}
        >
          <Text style={styles.btnText}>View Rent Tracker →</Text>
        </Pressable>
      </Card>

      <View style={styles.stats}>
        <StatBox
          label="My Flat"
          value={flatName ? "Joined" : "None"}
          sub={flatName ?? "Search flats"}
          onPress={onMyFlat}
        />
        <StatBox label="Maintenance" value={String(maintenanceCount)} sub="Open requests" />
        <StatBox
          label="Messages"
          value={String(unreadMessages)}
          sub="Unread"
          onPress={onMessages}
        />
        <StatBox
          label="Upcoming Bills"
          value={String(upcomingBills)}
          sub="This month"
          onPress={onRent}
        />
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Quick Actions</Text>
      <View style={styles.grid}>
        {[
          { label: "My Flat", icon: "🛏️", onPress: onMyFlat },
          { label: "Rent Tracker", icon: "💰", onPress: onRent },
          { label: "Messages", icon: "💬", onPress: onMessages },
        ].map((a) => (
          <Pressable
            key={a.label}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={a.onPress}
          >
            <Text style={styles.emoji}>{a.icon}</Text>
            <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

interface LandlordDashboardProps {
  monthlyIncome: number;
  propertyCount: number;
  pendingRequests: number;
  outstandingRent: number;
  maintenanceCount: number;
  onProperties: () => void;
  onRequests: () => void;
  onRent: () => void;
}

export function LandlordDashboard({
  monthlyIncome,
  propertyCount,
  pendingRequests,
  outstandingRent,
  maintenanceCount,
  onProperties,
  onRequests,
  onRent,
}: LandlordDashboardProps) {
  const { theme } = useTheme();

  return (
    <>
      <Card elevated>
        <View style={styles.featureTop}>
          <View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Monthly Income
            </Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatCurrency(monthlyIncome)}
            </Text>
            <Text style={[styles.sub, { color: theme.textMuted }]}>
              {propertyCount} propert{propertyCount === 1 ? "y" : "ies"}
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: theme.successMuted }]}>
            <Text style={[styles.pillText, { color: theme.success }]}>Portfolio</Text>
          </View>
        </View>
        <Pressable
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={onProperties}
        >
          <Text style={styles.btnText}>Manage Properties →</Text>
        </Pressable>
      </Card>

      <View style={styles.stats}>
        <StatBox
          label="Properties"
          value={String(propertyCount)}
          onPress={onProperties}
        />
        <StatBox
          label="Pending Requests"
          value={String(pendingRequests)}
          onPress={onRequests}
        />
        <StatBox
          label="Outstanding Rent"
          value={formatCurrency(outstandingRent)}
          onPress={onRent}
        />
        <StatBox label="Maintenance" value={String(maintenanceCount)} />
      </View>

      {pendingRequests > 0 && (
        <Pressable
          style={[styles.alert, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}
          onPress={onRequests}
        >
          <Text style={[styles.alertTitle, { color: theme.warning }]}>
            {pendingRequests} pending join request{pendingRequests > 1 ? "s" : ""}
          </Text>
          <Text style={[styles.alertSub, { color: theme.textSecondary }]}>
            Review in Requests →
          </Text>
        </Pressable>
      )}
    </>
  );
}

function StatBox({
  label,
  value,
  sub,
  onPress,
}: {
  label: string;
  value: string;
  sub?: string;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  const content = (
    <>
      <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      {sub && (
        <Text style={[styles.statSub, { color: theme.textMuted }]} numberOfLines={1}>
          {sub}
        </Text>
      )}
    </>
  );
  const boxStyle = [styles.stat, { backgroundColor: theme.card, borderColor: theme.border }];
  if (onPress) {
    return (
      <Pressable style={boxStyle} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return <View style={boxStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  featureTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6 },
  value: { fontSize: 34, fontWeight: "800", marginTop: 4 },
  sub: { fontSize: 13, marginTop: 2 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  stat: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  statSub: { fontSize: 10, marginTop: 2 },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12, marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  pressed: { opacity: 0.85 },
  emoji: { fontSize: 22, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: "600" },
  alert: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 8 },
  alertTitle: { fontSize: 15, fontWeight: "700" },
  alertSub: { fontSize: 13, marginTop: 4 },
});
