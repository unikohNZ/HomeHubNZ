import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ComputedRentPayment } from "../types/rent";
import { formatCurrency } from "../utils/format";
import { Card } from "./Card";

interface RentCardProps {
  payment: ComputedRentPayment;
}

export function RentCard({ payment }: RentCardProps) {
  const { theme } = useTheme();

  const tone =
    payment.computed_status === "paid"
      ? theme.success
      : payment.computed_status === "overdue"
        ? theme.danger
        : payment.computed_status === "upcoming"
          ? theme.primary
          : theme.warning;

  const toneBg =
    payment.computed_status === "paid"
      ? theme.successMuted
      : payment.computed_status === "overdue"
        ? theme.dangerMuted
        : payment.computed_status === "upcoming"
          ? theme.primaryMuted
          : theme.warningMuted;

  return (
    <Card>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: toneBg }]}>
          <Text>💰</Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: theme.text }]}>{payment.property_name}</Text>
          <Text style={[styles.date, { color: theme.textMuted }]}>
            Due {payment.due_date_display}
          </Text>
          {payment.payment_date_display && (
            <Text style={[styles.paid, { color: theme.success }]}>
              Paid {payment.payment_date_display}
            </Text>
          )}
          <Text style={[styles.days, { color: tone }]}>{payment.days_info}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: theme.text }]}>
            {formatCurrency(payment.amount)}
          </Text>
          <View style={[styles.badge, { backgroundColor: toneBg }]}>
            <Text style={[styles.badgeText, { color: tone }]}>
              {payment.status_label}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  date: { fontSize: 13, marginTop: 2 },
  paid: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  days: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  right: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: 16, fontWeight: "800" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
