import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "@/constants/theme";

type Variant = "primary" | "success" | "secondary" | "outline" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface AppButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.white },
  success: { bg: colors.success, text: colors.white },
  secondary: { bg: colors.surfaceElevated, text: colors.text, border: colors.border },
  outline: { bg: "transparent", text: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, text: colors.white },
  ghost: { bg: "transparent", text: colors.textSecondary },
};

const SIZES: Record<Size, { padV: number; padH: number; font: number; icon: number }> = {
  sm: { padV: 10, padH: 16, font: 14, icon: 16 },
  md: { padV: 14, padH: 22, font: 15, icon: 18 },
  lg: { padV: 16, padH: 26, font: 16, icon: 20 },
};

export function AppButton({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  ...props
}: AppButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border ?? "transparent",
          borderWidth: v.border ? 1.5 : 0,
          paddingVertical: s.padV,
          paddingHorizontal: s.padH,
          width: fullWidth ? "100%" : undefined,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={s.icon} color={v.text} />}
          <Text style={[styles.text, { color: v.text, fontSize: s.font }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontWeight: "700",
  },
});
