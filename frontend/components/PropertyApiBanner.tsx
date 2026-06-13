import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { PropertyDataSource } from "../src/services/propertyApi";

interface PropertyApiBannerProps {
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
  source: PropertyDataSource;
  onRetry?: () => void;
}

export function PropertyApiBanner({
  loading,
  saving,
  error,
  source,
  onRetry,
}: PropertyApiBannerProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ActivityIndicator color={theme.primary} size="small" />
        <Text style={[styles.text, { color: theme.textMuted }]}>Loading properties…</Text>
      </View>
    );
  }

  if (saving) {
    return (
      <View style={[styles.banner, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <ActivityIndicator color={theme.primary} size="small" />
        <Text style={[styles.text, { color: theme.primary }]}>Saving to API…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.banner, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}>
        <Text style={[styles.text, { color: theme.warning, flex: 1 }]}>
          {source === "mock" ? `Offline — ${error}` : error}
        </Text>
        {onRetry && (
          <Pressable onPress={onRetry} style={[styles.retry, { backgroundColor: theme.warning }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (source === "api") {
    return (
      <View style={[styles.banner, { backgroundColor: theme.successMuted, borderColor: theme.success }]}>
        <Text style={[styles.text, { color: theme.success }]}>✓ Connected to live API</Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.textMuted }]}>Using demo property data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  text: { fontSize: 13, fontWeight: "600" },
  retry: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  retryText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
