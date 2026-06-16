import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UserAvatar } from "./UserAvatar";
import { StatusBadge } from "./StatusBadge";
import { useTheme } from "../context/ThemeContext";
import { TenantPayment } from "../types/tenantPayment";
import { formatCurrency } from "../utils/format";
import { formatDate, parseDate } from "../utils/rentDates";
import {
  getTenantPaymentStats,
  getTenantPaymentStatus,
} from "../utils/tenantPaymentHelpers";
import { radius, spacing } from "../constants/design";

interface TenantPaymentDetailModalProps {
  visible: boolean;
  payment: TenantPayment | null;
  allPayments: TenantPayment[];
  onClose: () => void;
  onMarkPaid: (id: string) => void;
  onSendReminder: (id: string) => void;
  onViewReceipt: (id: string) => void;
  onMessage: (conversationId: string) => void;
}

export function TenantPaymentDetailModal({
  visible,
  payment,
  allPayments,
  onClose,
  onMarkPaid,
  onSendReminder,
  onViewReceipt,
  onMessage,
}: TenantPaymentDetailModalProps) {
  const { theme } = useTheme();

  if (!payment) return null;

  const { status, label } = getTenantPaymentStatus(payment.due_date, payment.payment_date);
  const stats = getTenantPaymentStats(allPayments, payment.tenant_id);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profile}>
              <UserAvatar name={payment.tenant_name} color={payment.avatar_color} size={64} />
              <Text style={[styles.name, { color: theme.text }]}>{payment.tenant_name}</Text>
              <Text style={[styles.email, { color: theme.textMuted }]}>{payment.tenant_email}</Text>
              <StatusBadge label={label} status={status} />
            </View>

            <InfoRow label="Property" value={payment.property_name} theme={theme} />
            <InfoRow label="Room" value={payment.room_number} theme={theme} />
            <InfoRow label="Weekly rent" value={formatCurrency(payment.weekly_rent)} theme={theme} />
            <InfoRow
              label="Due date"
              value={formatDate(parseDate(payment.due_date))}
              theme={theme}
            />

            <View style={styles.statsGrid}>
              <StatBox
                label="Paid this month"
                value={formatCurrency(stats.paidThisMonth)}
                theme={theme}
                tone={theme.success}
              />
              <StatBox
                label="Outstanding"
                value={formatCurrency(stats.outstandingBalance)}
                theme={theme}
                tone={theme.warning}
              />
              <StatBox
                label="Missed payments"
                value={String(stats.missedCount)}
                theme={theme}
                tone={theme.danger}
              />
            </View>

            <Text style={[styles.section, { color: theme.text }]}>Last 5 payments</Text>
            {stats.lastFive.map((p) => {
              const s = getTenantPaymentStatus(p.due_date, p.payment_date);
              return (
                <View
                  key={p.id}
                  style={[styles.historyRow, { borderColor: theme.border }]}
                >
                  <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                    {formatDate(parseDate(p.due_date))}
                  </Text>
                  <Text style={[styles.historyAmt, { color: theme.text }]}>
                    {formatCurrency(p.weekly_rent)}
                  </Text>
                  <StatusBadge label={s.label} status={s.status} />
                </View>
              );
            })}

            <View style={styles.actions}>
              {status !== "paid" && (
                <>
                  <PrimaryBtn
                    label="Mark as Paid"
                    bg={theme.success}
                    onPress={() => onMarkPaid(payment.id)}
                  />
                  <PrimaryBtn
                    label="Send Reminder"
                    bg={theme.warning}
                    onPress={() => onSendReminder(payment.id)}
                  />
                </>
              )}
              {status === "paid" && (
                <PrimaryBtn
                  label="View Receipt"
                  bg={theme.primary}
                  onPress={() => onViewReceipt(payment.id)}
                />
              )}
              {payment.conversation_id && (
                <PrimaryBtn
                  label="Message Tenant"
                  bg={theme.primaryMuted}
                  textColor={theme.primary}
                  onPress={() => onMessage(payment.conversation_id!)}
                />
              )}
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={[styles.closeText, { color: theme.textMuted }]}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function StatBox({
  label,
  value,
  theme,
  tone,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>["theme"];
  tone: string;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

function PrimaryBtn({
  label,
  bg,
  textColor = "#fff",
  onPress,
}: {
  label: string;
  bg: string;
  textColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.primaryBtn, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={[styles.primaryText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: spacing.lg,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#64748b",
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  profile: { alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm },
  name: { fontSize: 22, fontWeight: "800" },
  email: { fontSize: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "700" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.lg },
  statBox: {
    flex: 1,
    minWidth: "30%",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  statValue: { fontSize: 16, fontWeight: "800" },
  statLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
  section: { fontSize: 16, fontWeight: "800", marginBottom: spacing.sm },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  historyDate: { flex: 1, fontSize: 13 },
  historyAmt: { fontSize: 14, fontWeight: "700" },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  primaryBtn: { borderRadius: radius.lg, paddingVertical: 14, alignItems: "center" },
  primaryText: { fontWeight: "700", fontSize: 15 },
  closeBtn: { paddingVertical: spacing.lg, alignItems: "center" },
  closeText: { fontSize: 14, fontWeight: "600" },
});
