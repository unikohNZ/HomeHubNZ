import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { RentCard } from "../components/RentCard";
import { ScreenShell } from "../components/ScreenShell";
import { AppButton } from "../components/AppButton";
import { SectionHeader } from "../components/SectionHeader";
import { SegmentTabs } from "../components/ui/SegmentTabs";
import { TenantPaymentCard } from "../components/TenantPaymentCard";
import { TenantPaymentDetailModal } from "../components/TenantPaymentDetailModal";
import { useTheme } from "../context/ThemeContext";
import { LandlordDocument } from "../types/landlord";
import { RentSections } from "../types/rent";
import {
  TenantPayment,
  TenantPaymentFilter,
  WeekView,
} from "../types/tenantPayment";
import { formatCurrency } from "../utils/format";
import {
  computeWeeklySummary,
  getTenantPaymentStatus,
  getWeeklyTenantPayments,
  matchesPaymentFilter,
} from "../utils/tenantPaymentHelpers";
import { radius, spacing } from "../constants/design";

const WEEK_TABS: { id: WeekView; label: string }[] = [
  { id: "this", label: "This Week" },
  { id: "last", label: "Last Week" },
  { id: "next", label: "Next Week" },
];

const FILTER_TABS: { id: TenantPaymentFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "due_today", label: "Due Today" },
  { id: "pending", label: "Pending" },
  { id: "overdue", label: "Overdue" },
];

interface LandlordPaymentsScreenProps {
  sections: RentSections;
  expectedMonthlyIncome: number;
  collectedThisMonth: number;
  documents: LandlordDocument[];
  tenantPayments: TenantPayment[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onExportReport: () => void;
  onUploadDocument: () => void;
  onMarkTenantPaid: (id: string) => void;
  onSendRentReminder: (id: string) => void;
  onViewRentReceipt: (id: string) => void;
  onMessageTenant: (conversationId: string) => void;
}

export function LandlordPaymentsScreen({
  sections,
  expectedMonthlyIncome,
  collectedThisMonth,
  documents,
  tenantPayments,
  refreshing,
  onRefresh,
  onExportReport,
  onUploadDocument,
  onMarkTenantPaid,
  onSendRentReminder,
  onViewRentReceipt,
  onMessageTenant,
}: LandlordPaymentsScreenProps) {
  const { theme } = useTheme();
  const [weekView, setWeekView] = useState<WeekView>("this");
  const [statusFilter, setStatusFilter] = useState<TenantPaymentFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<TenantPayment | null>(null);

  const weeklySummary = useMemo(
    () => computeWeeklySummary(tenantPayments, weekView),
    [tenantPayments, weekView],
  );

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return getWeeklyTenantPayments(tenantPayments, weekView).filter((p) => {
      const { status } = getTenantPaymentStatus(p.due_date, p.payment_date);
      if (!matchesPaymentFilter(status, statusFilter)) return false;
      if (!q) return true;
      return (
        p.tenant_name.toLowerCase().includes(q) ||
        p.property_name.toLowerCase().includes(q) ||
        p.room_number.toLowerCase().includes(q)
      );
    });
  }, [tenantPayments, weekView, statusFilter, searchQuery]);

  const outstanding = sections.current_due_total;
  const overdue = sections.overdue_total;

  const reportCards = [
    { label: "Expected Monthly Income", value: formatCurrency(expectedMonthlyIncome), tone: theme.primary },
    { label: "Collected This Month", value: formatCurrency(collectedThisMonth), tone: theme.success },
    { label: "Outstanding Rent", value: formatCurrency(outstanding), tone: theme.warning },
    { label: "Overdue Rent", value: formatCurrency(overdue), tone: theme.danger },
  ];

  const weeklyCards = [
    { label: "Expected this week", value: formatCurrency(weeklySummary.expected), tone: theme.primary },
    { label: "Collected this week", value: formatCurrency(weeklySummary.collected), tone: theme.success },
    { label: "Outstanding this week", value: formatCurrency(weeklySummary.outstanding), tone: theme.warning },
    { label: "Overdue tenants", value: String(weeklySummary.overdueCount), tone: theme.danger },
  ];

  return (
    <>
      <ScreenShell
        title="Income & Rent"
        subtitle="Reports, payments & documents"
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <SectionHeader title="Tenant Payment Tracker" />
        <SegmentTabs tabs={WEEK_TABS} active={weekView} onChange={setWeekView} />

        <View style={styles.summaryGrid}>
          {weeklyCards.map((card) => (
            <View
              key={card.label}
              style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Text style={[styles.summaryValue, { color: card.tone }]}>{card.value}</Text>
              <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{card.label}</Text>
            </View>
          ))}
        </View>

        <TextInput
          style={[
            styles.search,
            { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
          ]}
          placeholder="Search tenant or property"
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <SegmentTabs tabs={FILTER_TABS} active={statusFilter} onChange={setStatusFilter} />

        {filteredPayments.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>
            No payments match your filters
          </Text>
        ) : (
          filteredPayments.map((payment) => (
            <TenantPaymentCard
              key={payment.id}
              payment={payment}
              onPress={() => setSelectedPayment(payment)}
              onMarkPaid={() => onMarkTenantPaid(payment.id)}
              onSendReminder={() => onSendRentReminder(payment.id)}
              onViewReceipt={() => onViewRentReceipt(payment.id)}
              onMessage={() =>
                payment.conversation_id && onMessageTenant(payment.conversation_id)
              }
            />
          ))
        )}

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

      <TenantPaymentDetailModal
        visible={!!selectedPayment}
        payment={selectedPayment}
        allPayments={tenantPayments}
        onClose={() => setSelectedPayment(null)}
        onMarkPaid={(id) => {
          onMarkTenantPaid(id);
          setSelectedPayment(null);
        }}
        onSendReminder={onSendRentReminder}
        onViewReceipt={onViewRentReceipt}
        onMessage={(cid) => {
          setSelectedPayment(null);
          onMessageTenant(cid);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: { width: "47%", flexGrow: 1, borderRadius: radius.xl, borderWidth: 1, padding: spacing.md },
  summaryValue: { fontSize: 17, fontWeight: "800" },
  summaryLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
  search: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: spacing.md,
  },
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
