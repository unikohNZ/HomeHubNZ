import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { PropertyFormData, PropertyType } from "../types/property";

const TYPES: PropertyType[] = ["Apartment", "Townhouse", "House", "Unit", "Studio"];

interface PropertyFormModalProps {
  visible: boolean;
  editing: boolean;
  form: PropertyFormData;
  onChange: (key: keyof PropertyFormData, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function PropertyFormModal({
  visible,
  editing,
  form,
  onChange,
  onSave,
  onClose,
}: PropertyFormModalProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboard}
        >
          <View style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: theme.text }]}>
              {editing ? "Edit Property" : "Create Property"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Field label="Property Name" value={form.name} onChange={(v) => onChange("name", v)} theme={theme} />
              <Field label="Address" value={form.address} onChange={(v) => onChange("address", v)} theme={theme} />
              <View style={styles.row}>
                <View style={styles.half}>
                  <Field label="Suburb" value={form.suburb} onChange={(v) => onChange("suburb", v)} theme={theme} />
                </View>
                <View style={styles.half}>
                  <Field label="City" value={form.city} onChange={(v) => onChange("city", v)} theme={theme} />
                </View>
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>Property Type</Text>
              <View style={styles.chips}>
                {TYPES.map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: form.property_type === t ? theme.primaryMuted : theme.card,
                        borderColor: form.property_type === t ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => onChange("property_type", t)}
                  >
                    <Text
                      style={{
                        color: form.property_type === t ? theme.primary : theme.textSecondary,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageEmoji}>🏠</Text>
                <Text style={[styles.imageText, { color: theme.textMuted }]}>
                  Property image placeholder
                </Text>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Field label="Bedrooms" value={form.bedrooms} onChange={(v) => onChange("bedrooms", v)} theme={theme} keyboardType="numeric" />
                </View>
                <View style={styles.half}>
                  <Field label="Bathrooms" value={form.bathrooms} onChange={(v) => onChange("bathrooms", v)} theme={theme} keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Field label="Weekly Rent ($)" value={form.weekly_rent} onChange={(v) => onChange("weekly_rent", v)} theme={theme} keyboardType="numeric" />
                </View>
                <View style={styles.half}>
                  <Field label="Bond ($)" value={form.bond} onChange={(v) => onChange("bond", v)} theme={theme} keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.half}>
                  <Field label="Available Rooms" value={form.available_rooms} onChange={(v) => onChange("available_rooms", v)} theme={theme} keyboardType="numeric" />
                </View>
                <View style={styles.half}>
                  <Field label="Max Flatmates" value={form.max_flatmates} onChange={(v) => onChange("max_flatmates", v)} theme={theme} keyboardType="numeric" />
                </View>
              </View>
              <Field label="Description" value={form.description} onChange={(v) => onChange("description", v)} theme={theme} multiline />
              <Field label="Rules & Conditions (comma-separated)" value={form.rules} onChange={(v) => onChange("rules", v)} theme={theme} multiline />

              <Pressable style={[styles.save, { backgroundColor: theme.primary }]} onPress={onSave}>
                <Text style={styles.saveText}>{editing ? "Update Property" : "Create Property"}</Text>
              </Pressable>
              <Pressable style={styles.cancel} onPress={onClose}>
                <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  theme,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  theme: ReturnType<typeof useTheme>["theme"];
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={theme.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  keyboard: { maxHeight: "92%" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    maxHeight: "100%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#64748b",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 16 },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  imagePlaceholder: {
    height: 120,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
    borderStyle: "dashed",
  },
  imageEmoji: { fontSize: 32 },
  imageText: { fontSize: 12, marginTop: 6 },
  field: { marginBottom: 12 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  save: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancel: { paddingVertical: 14, alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600" },
});
