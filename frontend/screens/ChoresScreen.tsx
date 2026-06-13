import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { Chore } from "../types/flat";
import { titleCase } from "../utils/format";

interface ChoresScreenProps {
  chores: Chore[];
  currentUserId: string;
  onBack: () => void;
  onComplete: (id: string) => void;
  onRequestSwap: (id: string) => void;
}

export function ChoresScreen({
  chores,
  currentUserId,
  onBack,
  onComplete,
  onRequestSwap,
}: ChoresScreenProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<"all" | "mine">("all");

  const filtered = useMemo(
    () =>
      filter === "mine"
        ? chores.filter((c) => c.assigned_id === currentUserId)
        : chores,
    [chores, filter, currentUserId],
  );

  const completed = chores.filter((c) => c.status === "completed").length;
  const pct = chores.length ? Math.round((completed / chores.length) * 100) : 0;

  return (
    <SubScreenLayout
      title="Chores"
      subtitle={`${pct}% completed this week`}
      onBack={onBack}
    >
      <View style={[styles.progress, { backgroundColor: theme.primaryMuted }]}>
        <Text style={[styles.progressText, { color: theme.primary }]}>
          {completed}/{chores.length} tasks done
        </Text>
      </View>

      <View style={styles.filters}>
        {(["all", "mine"] as const).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f ? theme.primaryMuted : theme.card,
                borderColor: filter === f ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={{ color: filter === f ? theme.primary : theme.textMuted, fontWeight: "700", fontSize: 13 }}>
              {f === "all" ? "All Tasks" : "My Tasks"}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.map((chore) => {
        const statusColor =
          chore.status === "completed"
            ? theme.success
            : chore.status === "overdue"
              ? theme.danger
              : theme.warning;
        const statusBg =
          chore.status === "completed"
            ? theme.successMuted
            : chore.status === "overdue"
              ? theme.dangerMuted
              : theme.warningMuted;

        return (
          <View
            key={chore.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.top}>
              <Text style={[styles.title, { color: theme.text }]}>{chore.title}</Text>
              <View style={[styles.badge, { backgroundColor: statusBg }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {titleCase(chore.status)}
                </Text>
              </View>
            </View>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {chore.assigned_to} · Due {chore.due_date} · {titleCase(chore.priority)} priority
            </Text>
            {chore.status !== "completed" && (
              <View style={styles.actions}>
                <Pressable
                  style={[styles.btn, { backgroundColor: theme.success }]}
                  onPress={() => onComplete(chore.id)}
                >
                  <Text style={styles.btnTextWhite}>Mark Complete</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, { backgroundColor: theme.primaryMuted }]}
                  onPress={() => onRequestSwap(chore.id)}
                >
                  <Text style={[styles.btnText, { color: theme.primary }]}>Request Swap</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  progress: { borderRadius: 14, padding: 14, marginBottom: 14, alignItems: "center" },
  progressText: { fontSize: 15, fontWeight: "800" },
  filters: { flexDirection: "row", gap: 10, marginBottom: 14 },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  meta: { fontSize: 13, marginTop: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnTextWhite: { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnText: { fontWeight: "700", fontSize: 13 },
});
