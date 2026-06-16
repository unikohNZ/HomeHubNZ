import { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";

interface AppCardProps {
  children: ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  padded?: boolean;
  style?: ViewStyle;
}

export function AppCard({ children, elevated, onPress, padded = true, style }: AppCardProps) {
  const { theme } = useTheme();
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    {
      backgroundColor: elevated ? theme.cardElevated : theme.card,
      borderColor: theme.border,
      ...(Platform.OS !== "web" && {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: elevated ? 0.14 : 0.08,
        shadowRadius: 12,
        elevation: elevated ? 4 : 2,
      }),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
