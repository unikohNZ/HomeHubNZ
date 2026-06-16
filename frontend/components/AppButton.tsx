import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, touchTarget } from "../constants/design";

type AppButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export function AppButton({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  style,
  icon,
}: AppButtonProps) {
  const { theme } = useTheme();

  const palette = {
    primary: { bg: theme.primary, text: "#fff", border: theme.primary },
    secondary: { bg: theme.primaryMuted, text: theme.primary, border: theme.primary },
    outline: { bg: theme.card, text: theme.text, border: theme.border },
    danger: { bg: theme.dangerMuted, text: theme.danger, border: theme.danger },
  }[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled || loading ? 0.6 : 1,
        },
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <Text style={[styles.label, { color: palette.text }]}>
          {icon ? `${icon} ` : ""}
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTarget,
  },
  pressed: { opacity: 0.88 },
  label: { fontSize: 15, fontWeight: "700" },
});
