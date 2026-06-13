import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color }: ProgressBarProps) {
  const { theme } = useTheme();
  const fillColor = color ?? theme.primary;
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { backgroundColor: theme.border }]}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

interface StarRatingProps {
  rating: number;
  max?: number;
}

export function StarRating({ rating, max = 5 }: StarRatingProps) {
  const { theme } = useTheme();
  const stars = Array.from({ length: max }, (_, i) => (i < Math.round(rating) ? "★" : "☆"));
  return (
    <Text style={[styles.stars, { color: theme.warning }]}>{stars.join("")}</Text>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  stars: { fontSize: 16, letterSpacing: 2 },
});
