import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppCard, Badge, LoadingSpinner } from "@/components";
import { useRentPayments } from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import { formatCurrency, formatDate, rentStatusTone } from "@/utils/format";
import { RentPayment } from "@/types";

export default function RentScreen() {
  const { data: payments, isLoading } = useRentPayments();

  const totals = useMemo(() => {
    const list = payments ?? [];
    const paid = list
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0);
    const due = list
      .filter((p) => p.status !== "paid")
      .reduce((s, p) => s + p.amount, 0);
    const overdue = list
      .filter((p) => p.status === "overdue")
      .reduce((s, p) => s + p.amount, 0);
    return { paid, due, overdue };
  }, [payments]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rent Tracker</Text>
          <Text style={styles.subtitle}>Payments across your portfolio</Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/add-payment")}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading payments..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryRow}>
            <View style={[styles.summaryBox, { borderColor: colors.warning }]}>
              <Text style={styles.summaryValue}>
                {formatCurrency(totals.due)}
              </Text>
              <Text style={styles.summaryLabel}>Total Due</Text>
            </View>
            <View style={[styles.summaryBox, { borderColor: colors.success }]}>
              <Text style={styles.summaryValue}>
                {formatCurrency(totals.paid)}
              </Text>
              <Text style={styles.summaryLabel}>Paid</Text>
            </View>
            <View style={[styles.summaryBox, { borderColor: colors.danger }]}>
              <Text style={styles.summaryValue}>
                {formatCurrency(totals.overdue)}
              </Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.list}>
            {(payments ?? []).map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PaymentRow({ payment }: { payment: RentPayment }) {
  const tone = rentStatusTone(payment.status);
  return (
    <AppCard style={styles.row}>
      <View
        style={[styles.rowIcon, { backgroundColor: tone.bg }]}
      >
        <Ionicons name="wallet" size={20} color={tone.text} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>
          {payment.property_name}
        </Text>
        <Text style={styles.rowDate}>
          {payment.status === "paid" && payment.payment_date
            ? `Paid ${formatDate(payment.payment_date)}`
            : `Due ${formatDate(payment.due_date)}`}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{formatCurrency(payment.amount)}</Text>
        <Badge label={payment.status} bg={tone.bg} text={tone.text} size="sm" />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  summaryRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryValue: { color: colors.text, fontSize: 18, fontWeight: "800" },
  summaryLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  rowName: { color: colors.text, fontSize: 15, fontWeight: "600" },
  rowDate: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  rowAmount: { color: colors.text, fontSize: 16, fontWeight: "800" },
});
