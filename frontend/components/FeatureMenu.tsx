import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SubScreen } from "../types/navigation";
import { FEATURE_MENU_ITEMS } from "../data/mockFlatData";

interface FeatureMenuProps {
  onNavigate: (screen: SubScreen) => void;
  disabled?: boolean;
}

export function FeatureMenu({ onNavigate, disabled }: FeatureMenuProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.grid}>
      {FEATURE_MENU_ITEMS.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.item,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              opacity: disabled ? 0.5 : 1,
            },
            pressed && !disabled && styles.pressed,
          ]}
          onPress={() => !disabled && onNavigate(item.id)}
          disabled={disabled}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={[styles.label, { color: theme.text }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  item: {
    width: "30%",
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    minWidth: 100,
  },
  pressed: { opacity: 0.85 },
  icon: { fontSize: 24, marginBottom: 6 },
  label: { fontSize: 11, fontWeight: "700", textAlign: "center" },
});
