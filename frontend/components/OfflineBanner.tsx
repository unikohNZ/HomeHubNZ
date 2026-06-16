import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";

interface OfflineBannerProps {
  loading?: boolean;
  saving?: boolean;
  isOffline?: boolean;
  isConnected?: boolean;
  onRetry?: () => void;
}

export function OfflineBanner({
  loading,
  saving,
  isOffline,
  isConnected,
  onRetry,
}: OfflineBannerProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ActivityIndicator color={theme.primary} size="small" />
        <Text style={[styles.text, { color: theme.textMuted }]}>Loading data…</Text>
      </View>
    );
  }

  if (saving) {
    return (
      <View style={[styles.banner, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <ActivityIndicator color={theme.primary} size="small" />
        <Text style={[styles.text, { color: theme.primary }]}>Saving changes…</Text>
      </View>
    );
  }

  if (isConnected) {
    return (
      <View style={[styles.banner, { backgroundColor: theme.successMuted, borderColor: theme.success }]}>
        <Text style={[styles.text, { color: theme.success }]}>✓ Connected to live API</Text>
      </View>
    );
  }

  if (!isOffline) {
    return null;
  }

  return (
    <View style={[styles.banner, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.textSecondary, flex: 1 }]}>
        Offline mode — displaying cached property data
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={[styles.retry, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  text: { fontSize: 13, fontWeight: "600" },
  retry: { borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  retryText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
