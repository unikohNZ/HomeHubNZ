import { Pressable, StyleSheet, Text, View } from "react-native";
import { RentCard } from "../components/RentCard";
import { ScreenShell } from "../components/ScreenShell";
import { Badge } from "../components/ui/Badge";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { RentSections } from "../types/rent";
import { formatCurrency } from "../utils/format";
import { formatDate, TODAY } from "../utils/rentDates";
import { radius, spacing } from "../constants/design";

interface RentScreenProps {
  sections: RentSections;
  onUploadReceipt: () => void;
  onDownloadLedger: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function RentScreen({
  sections,
  onUploadReceipt,
  onDownloadLedger,
  refreshing,
  onRefresh,
}: RentScreenProps) {
  const { theme } = useTheme();
  const todayLabel = formatDate(TODAY);

  return (
    <ScreenShell
      title="Rent Tracker"
      subtitle="Payments, due dates & ledger"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <View style={[styles.todayBar, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <View>
          <Text style={[styles.todayLabel, { color: theme.primary }]}>Current Date</Text>
          <Text style={[styles.todayDate, { color: theme.text }]}>{todayLabel}</Text>
        </View>
        <Badge
          label={sections.overdue_total > 0 ? "Overdue" : "On Track"}
          tone={sections.overdue_total > 0 ? "danger" : "success"}
        />
      </View>

      <View style={styles.summary}>
        <SummaryCard label="Current Due" value={formatCurrency(sections.current_due_total)} tone="warning" />
        <SummaryCard label="Upcoming" value={formatCurrency(sections.upcoming_total)} tone="primary" />
        <SummaryCard label="Overdue" value={formatCurrency(sections.overdue_total)} tone="danger" />
        <SummaryCard label="Paid This Month" value={formatCurrency(sections.paid_this_month)} tone="success" />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={onUploadReceipt}
        >
          <Text style={styles.actionTextPrimary}>📎 Upload Receipt</Text>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onDownloadLedger}
        >
          <Text style={[styles.actionText, { color: theme.text }]}>📥 Download Ledger</Text>
        </Pressable>
      </View>

      {sections.current_due.length > 0 && (
        <>
          <SectionHeader title="Current Due" />
          {sections.current_due.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}

      {sections.upcoming.length > 0 && (
        <>
          <SectionHeader title="Upcoming Payments" />
          {sections.upcoming.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}

      {sections.overdue.length > 0 && (
        <>
          <SectionHeader title="Overdue Payments" />
          {sections.overdue.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}

      {sections.history.length > 0 && (
        <>
          <SectionHeader title="Payment History" />
          {sections.history.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}
    </ScreenShell>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "danger";
}) {
  const { theme } = useTheme();
  const colors = {
    primary: { bg: theme.primaryMuted, text: theme.primary },
    success: { bg: theme.successMuted, text: theme.success },
    warning: { bg: theme.warningMuted, text: theme.warning },
    danger: { bg: theme.dangerMuted, text: theme.danger },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg, borderColor: theme.border }]}>
      <Text style={[styles.pillLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.pillValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  todayBar: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  todayDate: { fontSize: 18, fontWeight: "800", marginTop: 2 },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.lg },
  pill: { width: "47%", flexGrow: 1, borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg },
  pillLabel: { fontSize: 11, fontWeight: "600" },
  pillValue: { fontSize: 20, fontWeight: "800", marginTop: 4 },
  actions: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  actionBtn: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionTextPrimary: { color: "#fff", fontSize: 13, fontWeight: "700" },
  actionText: { fontSize: 13, fontWeight: "700" },
});
