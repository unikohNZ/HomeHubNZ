import { StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { LeaseTimeline } from "../types/flatExtended";

interface LeaseTimelineScreenProps {
  lease: LeaseTimeline;
  onBack: () => void;
}

export function LeaseTimelineScreen({ lease, onBack }: LeaseTimelineScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Lease Timeline" subtitle="Key dates & countdown" onBack={onBack}>
      <View style={[styles.countdown, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <Text style={[styles.countLabel, { color: theme.primary }]}>Lease expires in</Text>
        <Text style={[styles.countValue, { color: theme.text }]}>{lease.days_remaining} days</Text>
      </View>

      <View style={styles.dates}>
        {[
          { label: "Move In", value: lease.move_in },
          { label: "Inspection", value: lease.inspection },
          { label: "Renewal", value: lease.renewal },
          { label: "Lease End", value: lease.lease_end },
        ].map((d) => (
          <View key={d.label} style={[styles.dateRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.dateLabel, { color: theme.textMuted }]}>{d.label}</Text>
            <Text style={[styles.dateValue, { color: theme.text }]}>{d.value}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Timeline</Text>
      {lease.milestones.map((m, i) => (
        <View key={m.id} style={styles.milestone}>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: m.done ? theme.success : theme.border }]} />
            {i < lease.milestones.length - 1 && <View style={[styles.connector, { backgroundColor: theme.border }]} />}
          </View>
          <View style={styles.mContent}>
            <Text style={[styles.mLabel, { color: m.done ? theme.text : theme.textMuted }]}>{m.label}</Text>
            <Text style={[styles.mDate, { color: theme.textMuted }]}>{m.date}</Text>
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  countdown: { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 16 },
  countLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  countValue: { fontSize: 40, fontWeight: "800", marginTop: 4 },
  dates: { gap: 8, marginBottom: 16 },
  dateRow: { flexDirection: "row", justifyContent: "space-between", borderRadius: 14, borderWidth: 1, padding: 14 },
  dateLabel: { fontSize: 14, fontWeight: "600" },
  dateValue: { fontSize: 14, fontWeight: "800" },
  section: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  milestone: { flexDirection: "row", gap: 14, marginBottom: 4 },
  line: { alignItems: "center", width: 20 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  connector: { width: 2, flex: 1, minHeight: 30 },
  mContent: { flex: 1, paddingBottom: 16 },
  mLabel: { fontSize: 15, fontWeight: "700" },
  mDate: { fontSize: 13, marginTop: 2 },
});
