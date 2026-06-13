import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { radius, spacing } from "../../constants/design";

interface SegmentTabsProps<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}

export function SegmentTabs<T extends string>({ tabs, active, onChange }: SegmentTabsProps<T>) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? theme.primary : theme.card,
                borderColor: isActive ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={{
                color: isActive ? "#fff" : theme.textSecondary,
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: spacing.lg, maxHeight: 44 },
  row: { gap: spacing.sm, paddingRight: spacing.sm },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: "center",
  },
});
