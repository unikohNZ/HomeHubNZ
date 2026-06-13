import { StyleSheet, Text, View } from "react-native";
import { StarRating } from "../components/ProgressBar";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { HouseVibe } from "../types/flatExtended";

interface HouseVibeScreenProps {
  vibe: HouseVibe;
  onBack: () => void;
}

export function HouseVibeScreen({ vibe, onBack }: HouseVibeScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="House Vibe" subtitle="Flat compatibility score" onBack={onBack}>
      <View style={[styles.overall, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <Text style={[styles.overallLabel, { color: theme.primary }]}>Overall Score</Text>
        <Text style={[styles.overallValue, { color: theme.text }]}>{vibe.overall}/5</Text>
        <StarRating rating={vibe.overall} />
      </View>

      {vibe.categories.map((cat) => (
        <View key={cat.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.text }]}>{cat.label}</Text>
            <StarRating rating={cat.rating} />
          </View>
          <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
            <View style={[styles.barFill, { width: `${(cat.rating / 5) * 100}%`, backgroundColor: theme.warning }]} />
          </View>
          <Text style={[styles.score, { color: theme.textMuted }]}>{cat.rating}/5</Text>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  overall: { borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", marginBottom: 16 },
  overallLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  overallValue: { fontSize: 42, fontWeight: "800", marginVertical: 8 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 16, fontWeight: "700" },
  barTrack: { height: 6, borderRadius: 3, marginTop: 10, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  score: { fontSize: 12, marginTop: 6 },
});
