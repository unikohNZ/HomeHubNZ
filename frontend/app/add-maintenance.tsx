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
import { useCreateMaintenance, useProperties } from "@/hooks/useHomeHubData";
import { useToast } from "@/context/ToastContext";
import { colors, radius, spacing } from "@/constants/theme";
import { MaintenancePriority } from "@/types";
import { priorityTone, titleCase } from "@/utils/format";

const PRIORITIES: MaintenancePriority[] = ["low", "medium", "high", "urgent"];
const CATEGORIES = ["Plumbing", "Electrical", "Heating", "Exterior", "Safety", "Other"];

export default function AddMaintenanceScreen() {
  const { data: properties } = useProperties();
  const { mutateAsync, isPending } = useCreateMaintenance();
  const { showToast } = useToast();

  const [selectedId, setSelectedId] = useState<number | null>(
    properties?.[0]?.id ?? null,
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plumbing");
  const [priority, setPriority] = useState<MaintenancePriority>("medium");
  const [error, setError] = useState<string | null>(null);

  const selected = properties?.find((p) => p.id === selectedId);

  const submit = async () => {
    if (!title.trim() || !selected) {
      setError("Select a property and enter an issue title.");
      return;
    }
    setError(null);
    await mutateAsync({
      property_id: selected.id,
      property_name: selected.name,
      submitted_by: "You",
      title: title.trim(),
      description: description.trim() || "No additional details provided.",
      category,
      priority,
    });
    showToast("Maintenance request submitted");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Report an Issue" />
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
                onPress={() => setSelectedId(p.id)}
              >
                <Text style={styles.propertyName}>{p.name}</Text>
                {selectedId === p.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </Pressable>
            ))}
          </View>

          <AppInput
            label="Issue Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Leaking kitchen tap"
            icon="alert-circle-outline"
          />
          <AppInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail..."
            multiline
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Text
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, category === c && styles.chipActive]}
              >
                {c}
              </Text>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {PRIORITIES.map((p) => {
              const tone = priorityTone(p);
              const active = priority === p;
              return (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityBtn,
                    active && { backgroundColor: tone.bg, borderColor: tone.text },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      active && { color: tone.text },
                    ]}
                  >
                    {titleCase(p)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.submit}>
            <AppButton
              title="Submit Request"
              variant="primary"
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
    justifyContent: "space-between",
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: "hidden",
  },
  chipActive: {
    color: colors.primary,
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  priorityRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  priorityBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  priorityText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  error: { color: colors.dangerText, fontSize: 13, marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
});
