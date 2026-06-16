import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";

interface FeatureCardProps {
  icon: string;
  label: string;
  isFavorite?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
  disabled?: boolean;
}

export function FeatureCard({
  icon,
  label,
  isFavorite,
  onPress,
  onToggleFavorite,
  disabled,
}: FeatureCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isFavorite ? theme.primary + "66" : theme.border,
          opacity: disabled ? 0.5 : 1,
        },
        pressed && !disabled && styles.pressed,
      ]}
      onPress={() => !disabled && onPress()}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {onToggleFavorite && (
        <Pressable
          style={styles.starBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Unpin ${label}` : `Pin ${label}`}
        >
          <Text style={styles.star}>{isFavorite ? "★" : "☆"}</Text>
        </Pressable>
      )}
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "30%",
    flexGrow: 1,
    minWidth: 100,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
    alignItems: "center",
    position: "relative",
    minHeight: 96,
    justifyContent: "center",
  },
  pressed: { opacity: 0.85 },
  starBtn: { position: "absolute", top: 6, right: 8 },
  star: { fontSize: 14, color: "#f59e0b" },
  icon: { fontSize: 24, marginBottom: spacing.sm },
  label: { fontSize: 11, fontWeight: "700", textAlign: "center" },
});
