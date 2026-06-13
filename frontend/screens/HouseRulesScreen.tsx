import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { HouseRule, RuleCategory } from "../types/flat";
import { DemoRole } from "../types";

interface HouseRulesScreenProps {
  rules: HouseRule[];
  role: DemoRole;
  onBack: () => void;
  onAccept: (id: string) => void;
  onAcceptAll: () => void;
  onAddRule: (text: string, category: RuleCategory) => void;
}

const CATEGORIES: { id: RuleCategory; label: string }[] = [
  { id: "cleanliness", label: "Cleanliness" },
  { id: "payments", label: "Payments" },
  { id: "guests", label: "Guests" },
  { id: "safety", label: "Safety" },
  { id: "noise", label: "Noise" },
];

export function HouseRulesScreen({
  rules,
  role,
  onBack,
  onAccept,
  onAcceptAll,
  onAddRule,
}: HouseRulesScreenProps) {
  const { theme } = useTheme();
  const [newRule, setNewRule] = useState("");
  const [newCategory, setNewCategory] = useState<RuleCategory>("cleanliness");
  const unaccepted = rules.filter((r) => !r.accepted);

  return (
    <SubScreenLayout title="House Rules" subtitle="Flat agreements & expectations" onBack={onBack}>
      {unaccepted.length > 0 && (
        <View style={[styles.warning, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}>
          <Text style={[styles.warningTitle, { color: theme.warning }]}>
            {unaccepted.length} rule{unaccepted.length > 1 ? "s" : ""} not accepted
          </Text>
          <Pressable onPress={onAcceptAll}>
            <Text style={[styles.acceptAll, { color: theme.primary }]}>Accept all →</Text>
          </Pressable>
        </View>
      )}

      {rules.map((rule) => (
        <Pressable
          key={rule.id}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => !rule.accepted && onAccept(rule.id)}
        >
          <View style={styles.row}>
            <Text style={styles.check}>{rule.accepted ? "✅" : "⬜"}</Text>
            <View style={styles.flex}>
              <Text style={[styles.text, { color: theme.text }]}>{rule.text}</Text>
              <View style={[styles.chip, { backgroundColor: theme.primaryMuted }]}>
                <Text style={[styles.chipText, { color: theme.primary }]}>
                  {rule.category}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      ))}

      {role === "landlord" && (
        <View style={[styles.addSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.addTitle, { color: theme.text }]}>Add Rule (Landlord)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
            placeholder="New rule text..."
            placeholderTextColor={theme.textMuted}
            value={newRule}
            onChangeText={setNewRule}
          />
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: newCategory === c.id ? theme.primaryMuted : theme.bg,
                    borderColor: newCategory === c.id ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setNewCategory(c.id)}
              >
                <Text style={{ color: newCategory === c.id ? theme.primary : theme.textMuted, fontSize: 12, fontWeight: "600" }}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              if (newRule.trim()) {
                onAddRule(newRule.trim(), newCategory);
                setNewRule("");
              }
            }}
          >
            <Text style={styles.addBtnText}>Add Rule</Text>
          </Pressable>
        </View>
      )}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  warning: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14 },
  warningTitle: { fontSize: 14, fontWeight: "700" },
  acceptAll: { fontSize: 13, fontWeight: "700", marginTop: 6 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  row: { flexDirection: "row", gap: 12 },
  check: { fontSize: 20 },
  flex: { flex: 1 },
  text: { fontSize: 15, fontWeight: "600", lineHeight: 21 },
  chip: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  chipText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  addSection: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 8 },
  addTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  addBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "700" },
});
