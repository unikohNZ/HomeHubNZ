import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "../components/ProgressBar";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { ChecklistItem } from "../types/flatExtended";

interface ChecklistsScreenProps {
  items: ChecklistItem[];
  onBack: () => void;
  onToggle: (id: string) => void;
}

export function ChecklistsScreen({ items, onBack, onToggle }: ChecklistsScreenProps) {
  const { theme } = useTheme();
  const moveIn = items.filter((i) => i.phase === "move_in");
  const moveOut = items.filter((i) => i.phase === "move_out");
  const completed = items.filter((i) => i.completed).length;
  const pct = items.length ? Math.round((completed / items.length) * 100) : 0;

  return (
    <SubScreenLayout title="Checklists" subtitle={`${pct}% complete`} onBack={onBack}>
      <ProgressBar progress={pct} color={theme.success} />
      <Text style={[styles.pct, { color: theme.textMuted }]}>{completed}/{items.length} tasks done</Text>

      <Text style={[styles.section, { color: theme.text }]}>Move-In Tasks</Text>
      {moveIn.map((item) => (
        <ChecklistRow key={item.id} item={item} onToggle={onToggle} />
      ))}

      <Text style={[styles.section, { color: theme.text, marginTop: 16 }]}>Move-Out Tasks</Text>
      {moveOut.map((item) => (
        <ChecklistRow key={item.id} item={item} onToggle={onToggle} />
      ))}
    </SubScreenLayout>
  );
}

function ChecklistRow({ item, onToggle }: { item: ChecklistItem; onToggle: (id: string) => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => onToggle(item.id)}
    >
      <Text style={styles.check}>{item.completed ? "☑" : "☐"}</Text>
      <Text style={[styles.label, { color: item.completed ? theme.textMuted : theme.text, textDecorationLine: item.completed ? "line-through" : "none" }]}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pct: { fontSize: 13, marginTop: 6, marginBottom: 16 },
  section: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  check: { fontSize: 20 },
  label: { fontSize: 15, fontWeight: "600", flex: 1 },
});
