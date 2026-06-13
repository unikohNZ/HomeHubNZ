import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useTheme } from "../../context/ThemeContext";

type BadgeTone = "primary" | "success" | "warning" | "danger" | "accent" | "muted";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
}

export function Badge({ label, tone = "primary", style }: BadgeProps) {
  const { theme } = useTheme();
  const tones: Record<BadgeTone, { bg: string; text: string }> = {
    primary: { bg: theme.primaryMuted, text: theme.primary },
    success: { bg: theme.successMuted, text: theme.success },
    warning: { bg: theme.warningMuted, text: theme.warning },
    danger: { bg: theme.dangerMuted, text: theme.danger },
    accent: { bg: theme.accentMuted, text: theme.accent },
    muted: { bg: theme.cardElevated, text: theme.textSecondary },
  };
  const c = tones[tone];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
});
