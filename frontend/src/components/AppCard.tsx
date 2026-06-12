import { Pressable, StyleSheet, View, ViewProps } from "react-native";
import { colors, radius, shadow, spacing } from "@/constants/theme";

interface AppCardProps extends ViewProps {
  elevated?: boolean;
  onPress?: () => void;
  padded?: boolean;
}

export function AppCard({
  children,
  elevated = false,
  onPress,
  padded = true,
  style,
  ...props
}: AppCardProps) {
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.xl,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadow.card,
  },
});
