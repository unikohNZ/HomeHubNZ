import { ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../constants/design";

interface CardProps {
  children: ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, elevated, onPress, style }: CardProps) {
  const { theme } = useTheme();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: elevated ? theme.cardElevated : theme.card,
      borderColor: theme.border,
      ...(Platform.OS !== "web" && {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
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
    padding: 18,
    marginBottom: 14,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
