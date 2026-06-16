import { Pressable, StyleSheet, Text, View } from "react-native";
import { RentCard } from "../components/RentCard";
import { ScreenShell } from "../components/ScreenShell";
import { AppButton } from "../components/AppButton";
import { SectionHeader } from "../components/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { LandlordDocument } from "../types/landlord";
import { RentSections } from "../types/rent";
import { formatCurrency } from "../utils/format";
import { radius, spacing } from "../constants/design";

interface LandlordPaymentsScreenProps {
  sections: RentSections;
  expectedMonthlyIncome: number;
  collectedThisMonth: number;
  documents: LandlordDocument[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onExportReport: () => void;
  onUploadDocument: () => void;
}

export function LandlordPaymentsScreen({
  sections,
  expectedMonthlyIncome,
  collectedThisMonth,
  documents,
  refreshing,
  onRefresh,
  onExportReport,
  onUploadDocument,
}: LandlordPaymentsScreenProps) {
  const { theme } = useTheme();
  const outstanding = sections.current_due_total;
  const overdue = sections.overdue_total;

  const reportCards = [
    { label: "Expected Monthly Income", value: formatCurrency(expectedMonthlyIncome), tone: theme.primary },
    { label: "Collected This Month", value: formatCurrency(collectedThisMonth), tone: theme.success },
    { label: "Outstanding Rent", value: formatCurrency(outstanding), tone: theme.warning },
    { label: "Overdue Rent", value: formatCurrency(overdue), tone: theme.danger },
  ];

  return (
    <ScreenShell
      title="Income & Rent"
      subtitle="Reports, payments & documents"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <SectionHeader title="Income Report" />
      <View style={styles.reportGrid}>
        {reportCards.map((card) => (
          <View
            key={card.label}
            style={[styles.reportCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <Text style={[styles.reportValue, { color: card.tone }]}>{card.value}</Text>
            <Text style={[styles.reportLabel, { color: theme.textMuted }]}>{card.label}</Text>
          </View>
        ))}
      </View>
      <AppButton label="Export Report (mock)" onPress={onExportReport} variant="secondary" />

      <SectionHeader title="Rent History" />
      {sections.history.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>No payment history yet</Text>
      ) : (
        sections.history.map((p) => <RentCard key={p.id} payment={p} />)
      )}

      <SectionHeader title="Documents" />
      {documents.map((doc) => (
        <View key={doc.id} style={[styles.docCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.docTitle, { color: theme.text }]}>{doc.title}</Text>
          <Text style={[styles.docMeta, { color: theme.textMuted }]}>{doc.file_name}</Text>
          <Text style={[styles.docMeta, { color: theme.textSecondary }]}>{doc.upload_date}</Text>
        </View>
      ))}
      <Pressable
        style={[styles.uploadBtn, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}
        onPress={onUploadDocument}
      >
        <Text style={[styles.uploadText, { color: theme.primary }]}>Upload Document (mock)</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  reportGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  reportCard: { width: "47%", flexGrow: 1, borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg },
  reportValue: { fontSize: 18, fontWeight: "800" },
  reportLabel: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  empty: { fontSize: 14, marginBottom: spacing.lg },
  docCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  docTitle: { fontSize: 15, fontWeight: "800" },
  docMeta: { fontSize: 13, marginTop: 4 },
  uploadBtn: { borderRadius: radius.lg, borderWidth: 1, paddingVertical: 14, alignItems: "center", marginTop: spacing.sm },
  uploadText: { fontWeight: "700", fontSize: 14 },
});
