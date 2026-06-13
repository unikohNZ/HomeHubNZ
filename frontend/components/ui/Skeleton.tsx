import { StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { radius } from "../../constants/design";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  rounded?: number;
}

export function Skeleton({ width = "100%", height = 16, style, rounded = radius.md }: SkeletonProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.base,
        { width, height, borderRadius: rounded, backgroundColor: theme.cardElevated },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Skeleton height={120} rounded={radius.lg} />
      <Skeleton height={18} style={{ marginTop: 14, width: "70%" }} />
      <Skeleton height={14} style={{ marginTop: 8, width: "45%" }} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { opacity: 0.55 },
  card: { borderRadius: radius.xl, borderWidth: 1, padding: 18, marginBottom: 14 },
});
