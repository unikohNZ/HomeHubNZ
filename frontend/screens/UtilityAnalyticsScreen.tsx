import { StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { UtilityUsage } from "../types/flatExtended";
import { formatCurrency } from "../utils/format";

interface UtilityAnalyticsScreenProps {
  utilities: UtilityUsage[];
  onBack: () => void;
}

export function UtilityAnalyticsScreen({ utilities, onBack }: UtilityAnalyticsScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Utility Analytics" subtitle="Usage trends & comparisons" onBack={onBack}>
      {utilities.map((util) => {
        const max = Math.max(...util.months.map((m) => m.amount), 1);
        const latest = util.months[util.months.length - 1];
        const trendUp = util.trend_percent > 0;
        return (
          <View key={util.type} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.top}>
              <Text style={[styles.label, { color: theme.text }]}>{util.label}</Text>
              <Text style={[styles.trend, { color: trendUp ? theme.danger : theme.success }]}>
                {trendUp ? "+" : ""}{util.trend_percent}%
              </Text>
            </View>
            {util.months.map((m) => (
              <View key={m.month} style={styles.monthRow}>
                <Text style={[styles.month, { color: theme.textMuted, width: 40 }]}>{m.month}</Text>
                <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                  <View style={[styles.barFill, { width: `${(m.amount / max) * 100}%`, backgroundColor: theme.primary }]} />
                </View>
                <Text style={[styles.amount, { color: theme.text }]}>{formatCurrency(m.amount)}</Text>
              </View>
            ))}
            <Text style={[styles.latest, { color: theme.textSecondary }]}>
              Latest: {formatCurrency(latest?.amount ?? 0)} ({latest?.month})
            </Text>
          </View>
        );
      })}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 12 },
  top: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  label: { fontSize: 17, fontWeight: "800" },
  trend: { fontSize: 14, fontWeight: "800" },
  monthRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  month: { fontSize: 13, fontWeight: "600" },
  barTrack: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
  amount: { fontSize: 13, fontWeight: "700", width: 50, textAlign: "right" },
  latest: { fontSize: 12, marginTop: 8 },
});
