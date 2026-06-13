import { Pressable, StyleSheet, Text, View } from "react-native";
import { RentCard } from "../components/RentCard";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { RentSections } from "../types/rent";
import { formatCurrency } from "../utils/format";
import { formatDate, TODAY } from "../utils/rentDates";

interface RentScreenProps {
  sections: RentSections;
  onUploadReceipt: () => void;
  onDownloadLedger: () => void;
}

export function RentScreen({
  sections,
  onUploadReceipt,
  onDownloadLedger,
}: RentScreenProps) {
  const { theme } = useTheme();
  const todayLabel = formatDate(TODAY);

  return (
    <ScreenShell title="Rent Tracker" subtitle="Payments, due dates & history">
      <View style={[styles.todayBar, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <Text style={[styles.todayLabel, { color: theme.primary }]}>Today</Text>
        <Text style={[styles.todayDate, { color: theme.text }]}>{todayLabel}</Text>
      </View>

      <View style={styles.summary}>
        <SummaryPill
          label="Current Due"
          value={formatCurrency(sections.current_due_total)}
          tone="warning"
        />
        <SummaryPill
          label="Upcoming"
          value={formatCurrency(sections.upcoming_total)}
          tone="primary"
        />
        <SummaryPill
          label="Overdue"
          value={formatCurrency(sections.overdue_total)}
          tone="danger"
        />
        <SummaryPill
          label="Paid This Month"
          value={formatCurrency(sections.paid_this_month)}
          tone="success"
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionBtn, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}
          onPress={onUploadReceipt}
        >
          <Text style={[styles.actionText, { color: theme.primary }]}>📎 Upload Receipt</Text>
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
          <Text style={[styles.section, { color: theme.text }]}>Current Rent Due</Text>
          {sections.current_due.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}

      {sections.upcoming.length > 0 && (
        <>
          <Text style={[styles.section, { color: theme.text }]}>Upcoming Payments</Text>
          {sections.upcoming.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}

      {sections.overdue.length > 0 && (
        <>
          <Text style={[styles.section, { color: theme.text }]}>Overdue Payments</Text>
          {sections.overdue.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}

      {sections.history.length > 0 && (
        <>
          <Text style={[styles.section, { color: theme.text }]}>Payment History</Text>
          {sections.history.map((p) => (
            <RentCard key={p.id} payment={p} />
          ))}
        </>
      )}
    </ScreenShell>
  );
}

function SummaryPill({
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todayLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase" },
  todayDate: { fontSize: 16, fontWeight: "800" },
  summary: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  pill: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  pillLabel: { fontSize: 11, fontWeight: "600" },
  pillValue: { fontSize: 18, fontWeight: "800", marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: { fontSize: 13, fontWeight: "700" },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12, marginTop: 4 },
});
