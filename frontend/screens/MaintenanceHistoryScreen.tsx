import { StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { MaintenanceHistoryItem } from "../types/flatExtended";
import { formatCurrency } from "../utils/format";

interface MaintenanceHistoryScreenProps {
  history: MaintenanceHistoryItem[];
  onBack: () => void;
}

export function MaintenanceHistoryScreen({ history, onBack }: MaintenanceHistoryScreenProps) {
  const { theme } = useTheme();
  const totalCost = history.reduce((s, h) => s + h.cost, 0);

  return (
    <SubScreenLayout title="Maintenance History" subtitle={`${history.length} completed · ${formatCurrency(totalCost)} total`} onBack={onBack}>
      {history.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textMuted }]}>📅 {item.date}</Text>
            <Text style={[styles.cost, { color: theme.success }]}>{formatCurrency(item.cost)}</Text>
          </View>
          <Text style={[styles.contractor, { color: theme.primary }]}>🔧 {item.contractor}</Text>
          <Text style={[styles.notes, { color: theme.textSecondary }]}>{item.notes}</Text>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "800" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  meta: { fontSize: 13 },
  cost: { fontSize: 15, fontWeight: "800" },
  contractor: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  notes: { fontSize: 13, marginTop: 8, lineHeight: 19 },
});
