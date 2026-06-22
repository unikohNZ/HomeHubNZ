import { Pressable, StyleSheet, Text, View } from "react-native";
import { ELLA_PAGE } from "../../src/constants/ellaTheme";
import { platformShadow } from "../../utils/platformShadow";

interface EllaQuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function EllaQuickAction({ icon, label, onPress, disabled }: EllaQuickActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        platformShadow("0px 2px 8px rgba(124, 58, 237, 0.08)", {
          shadowColor: ELLA_PAGE.purple,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }),
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ELLA_PAGE.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.6 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ELLA_PAGE.purpleMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 18 },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: ELLA_PAGE.text,
  },
  chevron: {
    fontSize: 22,
    fontWeight: "300",
    color: ELLA_PAGE.purple,
    marginRight: 2,
  },
});
