import { StyleSheet, Text, View } from "react-native";
import { RentCard } from "../components/RentCard";
import { ScreenShell } from "../components/ScreenShell";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useTheme } from "../context/ThemeContext";
import { RentSections } from "../types/rent";
import { formatCurrency } from "../utils/format";
import { radius, spacing } from "../constants/design";

interface RentScreenProps {
  sections: RentSections;
  onUploadReceipt: () => void;
  onDownloadLedger: () => void;
  onRecordPayment?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function RentScreen({
  sections,
  onUploadReceipt,
  onDownloadLedger,
  onRecordPayment,
  refreshing,
  onRefresh,
}: RentScreenProps) {
  const { theme } = useTheme();

  const nextPayment =
    sections.current_due[0] ??
    sections.upcoming[0] ??
    sections.overdue[0] ??
    null;

  const heroStatus = nextPayment?.computed_status ?? (sections.overdue_total > 0 ? "overdue" : "upcoming");
  const heroLabel = nextPayment?.status_label ?? (sections.overdue_total > 0 ? "Overdue" : "Upcoming");

  return (
    <ScreenShell
      title="Rent Tracker"
      subtitle="Payments, due dates & ledger"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <AppCard elevated style={{ borderColor: theme.primary + "44" }}>
        <Text style={[styles.heroLabel, { color: theme.textMuted }]}>Next Payment</Text>
        {nextPayment ? (
          <>
            <Text style={[styles.heroAmount, { color: theme.text }]}>
              {formatCurrency(nextPayment.amount)}
            </Text>
            <Text style={[styles.heroMeta, { color: theme.textSecondary }]}>
              Due {nextPayment.due_date_display}
            </Text>
            <Text style={[styles.heroInfo, { color: theme.textMuted }]}>{nextPayment.days_info}</Text>
          </>
        ) : (
          <Text style={[styles.heroMeta, { color: theme.textSecondary }]}>No upcoming payments</Text>
        )}
        <View style={styles.heroBadgeRow}>
          <StatusBadge label={heroLabel} status={heroStatus} />
        </View>
        <AppButton
          label="Record Payment"
          onPress={onRecordPayment ?? onUploadReceipt}
          style={styles.heroBtn}
        />
      </AppCard>

      <View style={styles.secondaryActions}>
        <AppButton label="Upload Receipt" onPress={onUploadReceipt} variant="secondary" style={styles.halfBtn} />
        <AppButton label="Download Ledger" onPress={onDownloadLedger} variant="outline" style={styles.halfBtn} />
      </View>

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

      {sections.current_due.length > 0 && (
        <>
          <SectionHeader title="Due Today" />
          {sections.current_due.map((p) => (
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

const styles = StyleSheet.create({
  heroLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  heroAmount: { fontSize: 36, fontWeight: "800", marginTop: 4 },
  heroMeta: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  heroInfo: { fontSize: 13, marginTop: 4, fontWeight: "600" },
  heroBadgeRow: { marginTop: spacing.md },
  heroBtn: { marginTop: spacing.lg },
  secondaryActions: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  halfBtn: { flex: 1 },
});
