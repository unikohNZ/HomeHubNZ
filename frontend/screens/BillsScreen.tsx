import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { SharedBill } from "../types/flat";
import { FLATMATE_USER } from "../data/mockUsers";
import { titleCase, formatCurrency } from "../utils/format";

interface BillsScreenProps {
  bills: SharedBill[];
  onBack: () => void;
  onMarkPaid: (id: string) => void;
  onAddBill: () => void;
  onViewSplit: (id: string) => void;
}

export function BillsScreen({
  bills,
  onBack,
  onMarkPaid,
  onAddBill,
  onViewSplit,
}: BillsScreenProps) {
  const { theme } = useTheme();

  const youOwe = useMemo(
    () =>
      bills
        .filter((b) => b.owes.includes(FLATMATE_USER.name) && b.status !== "paid")
        .reduce((s, b) => s + b.split_amount, 0),
    [bills],
  );

  const paidThisMonth = useMemo(
    () =>
      bills
        .filter((b) => b.paid_by === FLATMATE_USER.name && b.status === "paid")
        .reduce((s, b) => s + b.split_amount, 0),
    [bills],
  );

  return (
    <SubScreenLayout title="Shared Bills" subtitle="Split utilities & household costs" onBack={onBack}>
      <View style={styles.summary}>
        <View style={[styles.sumCard, { backgroundColor: theme.dangerMuted }]}>
          <Text style={[styles.sumLabel, { color: theme.textMuted }]}>You owe</Text>
          <Text style={[styles.sumValue, { color: theme.danger }]}>{formatCurrency(youOwe)}</Text>
        </View>
        <View style={[styles.sumCard, { backgroundColor: theme.successMuted }]}>
          <Text style={[styles.sumLabel, { color: theme.textMuted }]}>Paid this month</Text>
          <Text style={[styles.sumValue, { color: theme.success }]}>
            {formatCurrency(paidThisMonth)}
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.addBtn, { backgroundColor: theme.primary }]}
        onPress={onAddBill}
      >
        <Text style={styles.addBtnText}>+ Add Mock Bill</Text>
      </Pressable>

      {bills.map((bill) => {
        const tone =
          bill.status === "paid"
            ? theme.success
            : bill.status === "overdue"
              ? theme.danger
              : theme.warning;
        const toneBg =
          bill.status === "paid"
            ? theme.successMuted
            : bill.status === "overdue"
              ? theme.dangerMuted
              : theme.warningMuted;
        const iOwe = bill.owes.includes(FLATMATE_USER.name);

        return (
          <View
            key={bill.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.top}>
              <Text style={[styles.label, { color: theme.text }]}>{bill.label}</Text>
              <View style={[styles.badge, { backgroundColor: toneBg }]}>
                <Text style={[styles.badgeText, { color: tone }]}>{titleCase(bill.status)}</Text>
              </View>
            </View>
            <Text style={[styles.amount, { color: theme.text }]}>
              {formatCurrency(bill.total_amount)} total · Your share {formatCurrency(bill.split_amount)}
            </Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              Due {bill.due_date}
              {bill.paid_by ? ` · Paid by ${bill.paid_by}` : ""}
            </Text>
            {bill.owes.length > 0 && (
              <Text style={[styles.owes, { color: theme.warning }]}>
                Owes: {bill.owes.join(", ")}
              </Text>
            )}
            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, { backgroundColor: theme.primaryMuted }]}
                onPress={() => onViewSplit(bill.id)}
              >
                <Text style={[styles.btnText, { color: theme.primary }]}>View Split</Text>
              </Pressable>
              {iOwe && bill.status !== "paid" && (
                <Pressable
                  style={[styles.btn, { backgroundColor: theme.success }]}
                  onPress={() => onMarkPaid(bill.id)}
                >
                  <Text style={styles.btnTextWhite}>Mark My Share Paid</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", gap: 10, marginBottom: 14 },
  sumCard: { flex: 1, borderRadius: 18, padding: 16 },
  sumLabel: { fontSize: 12, fontWeight: "600" },
  sumValue: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  addBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 14 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  top: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 17, fontWeight: "800" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  amount: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  meta: { fontSize: 13, marginTop: 4 },
  owes: { fontSize: 12, marginTop: 6, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnText: { fontWeight: "700", fontSize: 13 },
  btnTextWhite: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
