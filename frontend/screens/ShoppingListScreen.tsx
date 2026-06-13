import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ProgressBar } from "../components/ProgressBar";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { ShoppingItem } from "../types/flatExtended";

interface ShoppingListScreenProps {
  items: ShoppingItem[];
  onBack: () => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onTogglePurchased: (id: string) => void;
}

export function ShoppingListScreen({ items, onBack, onAdd, onRemove, onTogglePurchased }: ShoppingListScreenProps) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState("");
  const purchased = items.filter((i) => i.purchased).length;
  const pct = items.length ? Math.round((purchased / items.length) * 100) : 0;

  return (
    <SubScreenLayout title="Shopping List" subtitle={`${pct}% purchased`} onBack={onBack}>
      <ProgressBar progress={pct} color={theme.success} />
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          placeholder="Add item..."
          placeholderTextColor={theme.textMuted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft(""); } }}
        />
        <Pressable style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => { if (draft.trim()) { onAdd(draft.trim()); setDraft(""); } }}>
          <Text style={styles.addText}>+</Text>
        </Pressable>
      </View>
      {items.map((item) => (
        <View key={item.id} style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Pressable onPress={() => onTogglePurchased(item.id)}>
            <Text style={styles.check}>{item.purchased ? "✅" : "⬜"}</Text>
          </Pressable>
          <Text style={[styles.name, { color: item.purchased ? theme.textMuted : theme.text, textDecorationLine: item.purchased ? "line-through" : "none", flex: 1 }]}>
            {item.name}
          </Text>
          {item.purchaser && <Text style={[styles.buyer, { color: theme.success }]}>{item.purchaser}</Text>}
          <Pressable onPress={() => onRemove(item.id)}>
            <Text style={{ color: theme.danger }}>✕</Text>
          </Pressable>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: "row", gap: 10, marginVertical: 14 },
  input: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, fontSize: 15 },
  addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  addText: { color: "#fff", fontSize: 24, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  check: { fontSize: 18 },
  name: { fontSize: 15, fontWeight: "600" },
  buyer: { fontSize: 11, fontWeight: "600" },
});
