import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing } from "../../../constants/design";
import { useTheme } from "../../../context/ThemeContext";
import { ELLA_PAGE } from "../../constants/ellaTheme";

interface LocationSelectorProps {
  locationLabel?: string | null;
  onPress: () => void;
}

export function LocationSelector({ locationLabel, onPress }: LocationSelectorProps) {
  const { theme } = useTheme();
  const hasLocation = Boolean(locationLabel);

  return (
    <Pressable
      style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasLocation ? "Change search location" : "Set rental search location"}
    >
      <Text style={styles.pin}>📍</Text>
      <View style={styles.body}>
        <Text style={[styles.label, { color: theme.textMuted }]}>
          {hasLocation ? "Searching near" : "Set your rental search location"}
        </Text>
        {hasLocation ? (
          <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
            {locationLabel}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.change, { color: ELLA_PAGE.purple }]}>
        {hasLocation ? "Change" : "Set"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  pin: { fontSize: 18 },
  body: { flex: 1 },
  label: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 },
  value: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  change: { fontSize: 13, fontWeight: "800" },
});
