import { StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { MonthlyExpense } from "../types/flatExtended";
import { formatCurrency } from "../utils/format";
import { titleCase } from "../utils/format";

interface ExpensesScreenProps {
  expenses: MonthlyExpense[];
  onBack: () => void;
}

export function ExpensesScreen({ expenses, onBack }: ExpensesScreenProps) {
  const { theme } = useTheme();
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const paid = expenses.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const overdue = expenses.filter((e) => e.status === "overdue").reduce((s, e) => s + e.amount, 0);

  return (
    <SubScreenLayout title="Expenses" subtitle="Monthly household summary" onBack={onBack}>
      <View style={[styles.totalCard, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <Text style={[styles.totalLabel, { color: theme.primary }]}>Total This Month</Text>
        <Text style={[styles.totalValue, { color: theme.text }]}>{formatCurrency(total)}</Text>
      </View>

      <View style={styles.summary}>
        <SummaryPill label="Paid" value={formatCurrency(paid)} tone="success" />
        <SummaryPill label="Pending" value={formatCurrency(pending)} tone="warning" />
        <SummaryPill label="Overdue" value={formatCurrency(overdue)} tone="danger" />
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Breakdown</Text>
      {expenses.map((exp) => {
        const tone = exp.status === "paid" ? theme.success : exp.status === "overdue" ? theme.danger : theme.warning;
        const toneBg = exp.status === "paid" ? theme.successMuted : exp.status === "overdue" ? theme.dangerMuted : theme.warningMuted;
        const barWidth = total ? (exp.amount / total) * 100 : 0;
        return (
          <View key={exp.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.top}>
              <Text style={[styles.name, { color: theme.text }]}>{exp.label}</Text>
              <Text style={[styles.amount, { color: theme.text }]}>{formatCurrency(exp.amount)}</Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
              <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: tone }]} />
            </View>
            <View style={[styles.badge, { backgroundColor: toneBg }]}>
              <Text style={[styles.badgeText, { color: tone }]}>{titleCase(exp.status)}</Text>
            </View>
          </View>
        );
      })}
    </SubScreenLayout>
  );
}

function SummaryPill({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  const { theme } = useTheme();
  const colors = { success: theme.successMuted, warning: theme.warningMuted, danger: theme.dangerMuted };
  const textColors = { success: theme.success, warning: theme.warning, danger: theme.danger };
  return (
    <View style={[styles.pill, { backgroundColor: colors[tone] }]}>
      <Text style={[styles.pillLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.pillValue, { color: textColors[tone] }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  totalCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 14, alignItems: "center" },
  totalLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  totalValue: { fontSize: 32, fontWeight: "800", marginTop: 4 },
  summary: { flexDirection: "row", gap: 10, marginBottom: 16 },
  pill: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center" },
  pillLabel: { fontSize: 11, fontWeight: "600" },
  pillValue: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  section: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  top: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 16, fontWeight: "700" },
  amount: { fontSize: 16, fontWeight: "800" },
  barTrack: { height: 6, borderRadius: 3, marginTop: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
