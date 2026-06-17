import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          style={[styles.line, { backgroundColor: theme.cardElevated, width: `${90 - i * 10}%` }]}
        />
      ))}
      <ActivityIndicator color={theme.primary} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

export function QueryErrorView({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.errorBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.errorTitle, { color: theme.danger }]}>Could not load data</Text>
      <Text style={[styles.errorMsg, { color: theme.textMuted }]}>
        {message ?? "Check your connection and try again."}
      </Text>
      {onRetry && (
        <Pressable
          style={[styles.retryBtn, { backgroundColor: theme.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyStateView({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.errorBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.errorTitle, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.errorMsg, { color: theme.textMuted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg, gap: spacing.sm },
  line: { height: 14, borderRadius: radius.sm },
  errorBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  errorTitle: { fontSize: 16, fontWeight: "800", marginBottom: spacing.sm },
  errorMsg: { fontSize: 14, lineHeight: 20 },
  retryBtn: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  retryText: { color: "#fff", fontWeight: "700" },
});
