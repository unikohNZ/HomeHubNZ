import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../context/ThemeContext";
import { AvailabilityStatus, FlatmateAvailability } from "../types/flatExtended";

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  home: "#22c55e",
  away: "#f59e0b",
  working: "#3b82f6",
  vacation: "#a855f7",
};

interface AvailabilityScreenProps {
  availability: FlatmateAvailability[];
  onBack: () => void;
  onSetStatus: (id: string, status: AvailabilityStatus) => void;
}

export function AvailabilityScreen({ availability, onBack, onSetStatus }: AvailabilityScreenProps) {
  const { theme } = useTheme();
  const statuses: AvailabilityStatus[] = ["home", "away", "working", "vacation"];

  return (
    <SubScreenLayout title="Availability" subtitle="Who's home right now" onBack={onBack}>
      {availability.map((fm) => (
        <View key={fm.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.top}>
            <UserAvatar name={fm.name} color={fm.avatar_color} size={48} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{fm.name}</Text>
              <Text style={[styles.note, { color: theme.textMuted }]}>{fm.note}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[fm.status] + "33" }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLORS[fm.status] }]}>
                {fm.status === "home" ? "Home" : fm.status === "away" ? "Away" : fm.status === "working" ? "Working" : "Vacation"}
              </Text>
            </View>
          </View>
          <View style={styles.chips}>
            {statuses.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, { backgroundColor: fm.status === s ? STATUS_COLORS[s] + "33" : theme.bg, borderColor: fm.status === s ? STATUS_COLORS[s] : theme.border }]}
                onPress={() => onSetStatus(fm.id, s)}
              >
                <Text style={{ color: fm.status === s ? STATUS_COLORS[s] : theme.textMuted, fontSize: 11, fontWeight: "700" }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800" },
  note: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
});
