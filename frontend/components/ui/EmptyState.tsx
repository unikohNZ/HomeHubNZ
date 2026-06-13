import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { radius, spacing } from "../../constants/design";

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      )}
      {actionLabel && onAction && (
        <Pressable style={[styles.btn, { backgroundColor: theme.primary }]} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xxl,
    alignItems: "center",
    marginVertical: spacing.md,
  },
  icon: { fontSize: 40, marginBottom: spacing.md },
  title: { fontSize: 17, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 14, marginTop: spacing.sm, textAlign: "center", lineHeight: 20 },
  btn: { marginTop: spacing.lg, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
