import { Pressable, StyleSheet, Text, View } from "react-native";
import { UserAvatar } from "./UserAvatar";
import { StatusBadge } from "./StatusBadge";
import { useTheme } from "../context/ThemeContext";
import { TenantPayment } from "../types/tenantPayment";
import { formatCurrency } from "../utils/format";
import { formatDate, parseDate } from "../utils/rentDates";
import { getTenantPaymentStatus } from "../utils/tenantPaymentHelpers";
import { radius, spacing } from "../constants/design";

interface TenantPaymentCardProps {
  payment: TenantPayment;
  onPress: () => void;
  onMarkPaid: () => void;
  onSendReminder: () => void;
  onViewReceipt: () => void;
  onMessage: () => void;
}

export function TenantPaymentCard({
  payment,
  onPress,
  onMarkPaid,
  onSendReminder,
  onViewReceipt,
  onMessage,
}: TenantPaymentCardProps) {
  const { theme } = useTheme();
  const { status, label } = getTenantPaymentStatus(payment.due_date, payment.payment_date);
  const isPaid = status === "paid";

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={styles.top}>
        <UserAvatar name={payment.tenant_name} color={payment.avatar_color} size={44} />
        <View style={styles.flex}>
          <Text style={[styles.name, { color: theme.text }]}>{payment.tenant_name}</Text>
          <Text style={[styles.prop, { color: theme.textMuted }]}>
            {payment.property_name} · {payment.room_number}
          </Text>
        </View>
        <StatusBadge label={label} status={status} />
      </View>

      <View style={styles.metaRow}>
        <Meta label="Weekly rent" value={formatCurrency(payment.weekly_rent)} theme={theme} />
        <Meta label="Due" value={formatDate(parseDate(payment.due_date))} theme={theme} />
      </View>

      {isPaid ? (
        <View style={styles.metaRow}>
          <Meta
            label="Paid"
            value={formatDate(parseDate(payment.payment_date!))}
            theme={theme}
          />
          <Meta label="Method" value={payment.payment_method ?? "—"} theme={theme} />
        </View>
      ) : null}

      <View style={styles.actions}>
        {!isPaid && (
          <>
            <ActionBtn label="Mark Paid" color={theme.success} onPress={onMarkPaid} />
            <ActionBtn label="Reminder" color={theme.warning} onPress={onSendReminder} />
          </>
        )}
        {isPaid && (
          <ActionBtn label="Receipt" color={theme.primary} onPress={onViewReceipt} />
        )}
        <ActionBtn label="Message" color={theme.primary} onPress={onMessage} muted />
      </View>
    </Pressable>
  );
}

function Meta({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionBtn({
  label,
  color,
  onPress,
  muted,
}: {
  label: string;
  color: string;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable
      style={[styles.actionBtn, { backgroundColor: muted ? color + "22" : color }]}
      onPress={(e) => {
        e.stopPropagation?.();
        onPress();
      }}
    >
      <Text style={[styles.actionText, { color: muted ? color : "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800" },
  prop: { fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  meta: { flex: 1 },
  metaLabel: { fontSize: 11, fontWeight: "600" },
  metaValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md },
  actionText: { fontSize: 12, fontWeight: "700" },
});
