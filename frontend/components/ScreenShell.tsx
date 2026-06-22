import { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../constants/design";

interface ScreenShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerContent?: ReactNode;
  headerRight?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra bottom padding so content clears fixed tab bars (default 32). */
  bottomPadding?: number;
  onBack?: () => void;
}

export function ScreenShell({
  title,
  subtitle,
  children,
  headerContent,
  headerRight,
  refreshing,
  onRefresh,
  bottomPadding = spacing.xxxl,
  onBack,
}: ScreenShellProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces
      alwaysBounceVertical
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        ) : undefined
      }
    >
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back} hitSlop={12} accessibilityRole="button">
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </Pressable>
      ) : null}
      <View style={styles.header}>
        {headerContent ?? (
          <View style={styles.headerText}>
            {title ? (
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            ) : null}
            {subtitle && (
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
            )}
          </View>
        )}
        {headerRight}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.xl, flexGrow: 1 },
  back: { marginBottom: spacing.sm, minHeight: 44, justifyContent: "center" },
  backText: { fontSize: 15, fontWeight: "700" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xl,
  },
  headerText: { flex: 1 },
  title: { ...typography.hero, color: "#fff" },
  subtitle: { fontSize: 14, marginTop: spacing.xs, lineHeight: 20 },
});
