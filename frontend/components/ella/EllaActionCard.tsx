import { Pressable, StyleSheet, Text, View } from "react-native";
import { ELLA_PAGE } from "../../src/constants/ellaTheme";
import { platformShadow } from "../../utils/platformShadow";

interface EllaActionCardProps {
  icon: string;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
}

export function EllaActionCard({ icon, title, onPress, disabled, accent }: EllaActionCardProps) {
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.card,
        accent && styles.cardAccent,
        platformShadow("0px 4px 14px rgba(124, 58, 237, 0.1)", {
          shadowColor: ELLA_PAGE.purple,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 3,
        }),
        pressed && styles.pressed,
        (hovered as boolean) && styles.hovered,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.iconWrap, accent && styles.iconWrapAccent]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.title, accent && styles.titleAccent]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: ELLA_PAGE.card,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    minHeight: 108,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.06)",
  },
  cardAccent: {
    backgroundColor: ELLA_PAGE.purpleMuted,
    borderColor: "rgba(124, 58, 237, 0.15)",
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  hovered: {
    transform: [{ scale: 1.02 }],
  },
  disabled: { opacity: 0.5 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ELLA_PAGE.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconWrapAccent: {
    backgroundColor: ELLA_PAGE.purple,
  },
  icon: { fontSize: 22 },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: ELLA_PAGE.text,
    textAlign: "center",
    lineHeight: 18,
  },
  titleAccent: { color: ELLA_PAGE.purpleDark },
});
