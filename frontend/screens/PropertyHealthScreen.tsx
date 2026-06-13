import { StyleSheet, Text, View } from "react-native";
import { ProgressBar } from "../components/ProgressBar";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { PropertyHealth } from "../types/flatExtended";

interface PropertyHealthScreenProps {
  health: PropertyHealth;
  onBack: () => void;
}

export function PropertyHealthScreen({ health, onBack }: PropertyHealthScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Property Health" subtitle="Household performance score" onBack={onBack}>
      <View style={[styles.overall, { backgroundColor: theme.successMuted, borderColor: theme.success }]}>
        <Text style={[styles.overallLabel, { color: theme.success }]}>Overall Score</Text>
        <Text style={[styles.overallValue, { color: theme.text }]}>{health.overall}/100</Text>
        <ProgressBar progress={health.overall} color={theme.success} />
      </View>

      {health.metrics.map((m) => (
        <View key={m.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>{m.label}</Text>
            <Text style={[styles.score, { color: m.score >= 90 ? theme.success : theme.warning }]}>{m.score}%</Text>
          </View>
          <ProgressBar progress={m.score} color={m.score >= 90 ? theme.success : theme.warning} />
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  overall: { borderRadius: 24, borderWidth: 1, padding: 24, marginBottom: 16, alignItems: "center" },
  overallLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  overallValue: { fontSize: 42, fontWeight: "800", marginVertical: 8 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  label: { fontSize: 15, fontWeight: "700" },
  score: { fontSize: 18, fontWeight: "800" },
});
