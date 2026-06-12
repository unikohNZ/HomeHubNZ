import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton, AppInput, ScreenHeader } from "@/components";
import { useCreatePayment, useProperties } from "@/hooks/useHomeHubData";
import { useToast } from "@/context/ToastContext";
import { colors, radius, spacing } from "@/constants/theme";
import { RentStatus } from "@/types";
import { titleCase } from "@/utils/format";

const STATUSES: RentStatus[] = ["paid", "pending", "overdue"];

export default function AddPaymentScreen() {
  const { data: properties } = useProperties();
  const { mutateAsync, isPending } = useCreatePayment();
  const { showToast } = useToast();

  const [selectedId, setSelectedId] = useState<number | null>(
    properties?.[0]?.id ?? null,
  );
  const [amount, setAmount] = useState(
    properties?.[0] ? String(properties[0].rent_amount) : "",
  );
  const [date, setDate] = useState("12 Jun 2026");
  const [status, setStatus] = useState<RentStatus>("paid");
  const [error, setError] = useState<string | null>(null);

  const selected = properties?.find((p) => p.id === selectedId);

  const submit = async () => {
    if (!selected || !amount) {
      setError("Select a property and enter an amount.");
      return;
    }
    setError(null);
    await mutateAsync({
      property_id: selected.id,
      property_name: selected.name,
      amount: parseFloat(amount) || 0,
      due_date: new Date().toISOString(),
      payment_date: status === "paid" ? new Date().toISOString() : undefined,
      status,
      method: "Bank transfer",
    });
    showToast("Payment recorded");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Record Payment" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Property</Text>
          <View style={styles.propertyList}>
            {(properties ?? []).map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.propertyItem,
                  selectedId === p.id && styles.propertyItemActive,
                ]}
                onPress={() => {
                  setSelectedId(p.id);
                  setAmount(String(p.rent_amount));
                }}
              >
                <View style={styles.flex}>
                  <Text style={styles.propertyName}>{p.name}</Text>
                  <Text style={styles.propertySub}>
                    {p.suburb}, {p.city}
                  </Text>
                </View>
                {selectedId === p.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            ))}
          </View>

          <AppInput
            label="Amount ($)"
            value={amount}
            onChangeText={setAmount}
            placeholder="750"
            keyboardType="numeric"
            icon="cash-outline"
          />
          <AppInput
            label="Payment Date"
            value={date}
            onChangeText={setDate}
            placeholder="12 Jun 2026"
            icon="calendar-outline"
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.chips}>
            {STATUSES.map((s) => (
              <Text
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.chip, status === s && styles.chipActive]}
              >
                {titleCase(s)}
              </Text>
            ))}
          </View>

          <Pressable style={styles.upload}>
            <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={styles.uploadTitle}>Upload Receipt</Text>
              <Text style={styles.uploadSub}>PDF or image · optional</Text>
            </View>
            <Ionicons name="add" size={20} color={colors.textMuted} />
          </Pressable>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.submit}>
            <AppButton
              title="Record Payment"
              variant="success"
              loading={isPending}
              onPress={submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  propertyList: { gap: spacing.sm, marginBottom: spacing.lg },
  propertyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  propertyItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  propertyName: { color: colors.text, fontSize: 14, fontWeight: "600" },
  propertySub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  chips: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    overflow: "hidden",
  },
  chipActive: {
    color: colors.primary,
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  upload: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  uploadTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  uploadSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  error: { color: colors.dangerText, fontSize: 13, marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
});
