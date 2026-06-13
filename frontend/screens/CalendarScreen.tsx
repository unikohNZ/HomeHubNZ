import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { CalendarEvent, CalendarEventType } from "../types/flat";
import { formatDate, getDaysDifference, parseDate, TODAY } from "../utils/rentDates";
import { nextId } from "../data/formDefaults";

interface CalendarScreenProps {
  events: CalendarEvent[];
  onBack: () => void;
  onAddEvent: (event: CalendarEvent) => void;
}

const FILTERS: { id: CalendarEventType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rent", label: "Rent" },
  { id: "bill", label: "Bills" },
  { id: "inspection", label: "Inspection" },
  { id: "meeting", label: "Meeting" },
  { id: "maintenance", label: "Maintenance" },
  { id: "lease", label: "Lease" },
];

function periodLabel(dateStr: string): "Today" | "This Week" | "This Month" | "Later" {
  const d = parseDate(dateStr);
  const diff = getDaysDifference(d, TODAY);
  if (diff === 0) return "Today";
  if (diff > 0 && diff <= 7) return "This Week";
  if (d.getMonth() === TODAY.getMonth() && d.getFullYear() === TODAY.getFullYear())
    return "This Month";
  return "Later";
}

export function CalendarScreen({ events, onBack, onAddEvent }: CalendarScreenProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<CalendarEventType | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.event_type === filter)),
    [events, filter],
  );

  const grouped = useMemo(() => {
    const order = ["Today", "This Week", "This Month", "Later"] as const;
    const map: Record<string, CalendarEvent[]> = {};
    filtered.forEach((e) => {
      const p = periodLabel(e.date);
      if (!map[p]) map[p] = [];
      map[p].push(e);
    });
    return order.filter((o) => map[o]?.length).map((o) => ({ period: o, items: map[o] }));
  }, [filtered]);

  const handleAdd = () => {
    onAddEvent({
      id: nextId(),
      date: "2026-06-25",
      time: "6:00 PM",
      title: "Flat BBQ",
      event_type: "meeting",
      color: "#22c55e",
    });
  };

  return (
    <SubScreenLayout title="Flat Calendar" subtitle="Upcoming household events" onBack={onBack}>
      <Pressable
        style={[styles.addBtn, { backgroundColor: theme.primary }]}
        onPress={handleAdd}
      >
        <Text style={styles.addBtnText}>+ Add Mock Event</Text>
      </Pressable>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f.id ? theme.primaryMuted : theme.card,
                borderColor: filter === f.id ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={{ color: filter === f.id ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: "700" }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {grouped.map((group) => (
        <View key={group.period}>
          <Text style={[styles.period, { color: theme.text }]}>{group.period}</Text>
          {group.items.map((e) => (
            <View
              key={e.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.dot, { backgroundColor: e.color }]} />
              <View style={styles.flex}>
                <Text style={[styles.title, { color: theme.text }]}>{e.title}</Text>
                <Text style={[styles.meta, { color: theme.textMuted }]}>
                  {formatDate(parseDate(e.date))} · {e.time}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: e.color + "22" }]}>
                  <Text style={[styles.typeText, { color: e.color }]}>{e.event_type}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  addBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginBottom: 14 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  period: { fontSize: 16, fontWeight: "800", marginBottom: 10, marginTop: 8 },
  card: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  flex: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 13, marginTop: 4 },
  typeBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginTop: 6 },
  typeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
});
