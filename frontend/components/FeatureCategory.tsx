import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";

interface FeatureCategoryProps {
  title: string;
  icon: string;
  count: number;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function FeatureCategory({
  title,
  icon,
  count,
  defaultExpanded = false,
  children,
}: FeatureCategoryProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (count === 0) return null;

  return (
    <View style={styles.wrap}>
      <Pressable
        style={[
          styles.header,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.categoryIcon}>{icon}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.count, { color: theme.textMuted }]}>
            {count} feature{count === 1 ? "" : "s"}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: theme.textMuted }]}>
          {expanded ? "▾" : "▸"}
        </Text>
      </Pressable>
      {expanded && <View style={styles.grid}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  categoryIcon: { fontSize: 22 },
  headerText: { flex: 1 },
  title: { fontSize: 15, fontWeight: "800" },
  count: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  chevron: { fontSize: 16, fontWeight: "700" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: 2,
  },
});
