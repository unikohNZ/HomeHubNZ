import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "../components/ProgressBar";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { BondTracker } from "../types/flatExtended";
import { formatCurrency } from "../utils/format";
import { titleCase } from "../utils/format";

interface BondTrackerScreenProps {
  bond: BondTracker;
  onBack: () => void;
}

export function BondTrackerScreen({ bond, onBack }: BondTrackerScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Bond Tracker" subtitle={`Bond #${bond.bond_number}`} onBack={onBack}>
      <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textMuted }]}>Total Bond</Text>
        <Text style={[styles.total, { color: theme.text }]}>{formatCurrency(bond.total_bond)}</Text>
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={[styles.subLabel, { color: theme.textMuted }]}>My Share</Text>
            <Text style={[styles.share, { color: theme.primary }]}>{formatCurrency(bond.my_share)}</Text>
          </View>
          <View style={styles.half}>
            <Text style={[styles.subLabel, { color: theme.textMuted }]}>Status</Text>
            <Text style={[styles.share, { color: theme.success }]}>{titleCase(bond.status)}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Bond Timeline</Text>
      <ProgressBar progress={bond.progress} color={theme.success} />
      <Text style={[styles.progressLabel, { color: theme.textMuted }]}>{bond.progress}% complete</Text>

      {bond.timeline.map((step) => (
        <View key={step.label} style={styles.step}>
          <Text style={styles.stepIcon}>{step.done ? "✓" : step.pending ? "⏳" : "○"}</Text>
          <Text style={[styles.stepText, { color: step.done ? theme.success : step.pending ? theme.warning : theme.textMuted }]}>
            {step.label}
          </Text>
        </View>
      ))}

      {bond.refund_status !== "none" && (
        <View style={[styles.refund, { backgroundColor: theme.warningMuted }]}>
          <Text style={[styles.refundText, { color: theme.warning }]}>
            Refund: {titleCase(bond.refund_status)}
          </Text>
        </View>
      )}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  total: { fontSize: 36, fontWeight: "800", marginTop: 4 },
  row: { flexDirection: "row", gap: 16, marginTop: 16 },
  half: { flex: 1 },
  subLabel: { fontSize: 12 },
  share: { fontSize: 20, fontWeight: "800", marginTop: 4 },
  section: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  progressLabel: { fontSize: 12, marginTop: 6, marginBottom: 16 },
  step: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  stepIcon: { fontSize: 18, width: 24 },
  stepText: { fontSize: 15, fontWeight: "600" },
  refund: { borderRadius: 14, padding: 14, marginTop: 12, alignItems: "center" },
  refundText: { fontWeight: "700" },
});
