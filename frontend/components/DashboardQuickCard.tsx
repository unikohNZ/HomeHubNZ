import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SubScreen } from "../types/navigation";

interface DashboardQuickCardProps {
  icon: string;
  label: string;
  badge?: number;
  onPress: () => void;
}

export function DashboardQuickCard({ icon, label, badge, onPress }: DashboardQuickCardProps) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.danger }]}>
          <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
        </View>
      )}
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

interface DashboardQuickGridProps {
  items: { id: SubScreen; label: string; icon: string; badge?: number }[];
  onNavigate: (screen: SubScreen) => void;
}

export function DashboardQuickGrid({ items, onNavigate }: DashboardQuickGridProps) {
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <DashboardQuickCard
          key={item.id}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          onPress={() => onNavigate(item.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  card: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    minWidth: 95,
    position: "relative",
  },
  pressed: { opacity: 0.88 },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  icon: { fontSize: 22, marginBottom: 6 },
  label: { fontSize: 10, fontWeight: "700", textAlign: "center" },
});
