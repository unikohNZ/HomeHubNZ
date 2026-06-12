import { StyleSheet, Text, View } from "react-native";
import { radius } from "@/constants/theme";
import { titleCase } from "@/utils/format";

interface BadgeProps {
  label: string;
  bg: string;
  text: string;
  size?: "sm" | "md";
}

export function Badge({ label, bg, text, size = "md" }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        size === "sm" ? styles.sm : styles.md,
        { backgroundColor: bg },
      ]}
    >
      <Text
        style={[styles.text, { color: text, fontSize: size === "sm" ? 11 : 12 }]}
      >
        {titleCase(label)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  sm: { paddingHorizontal: 8, paddingVertical: 3 },
  md: { paddingHorizontal: 11, paddingVertical: 5 },
  text: { fontWeight: "700" },
});
