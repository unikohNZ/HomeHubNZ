import { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../constants/design";

interface ScreenShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra bottom padding so content clears fixed tab bars (default 32). */
  bottomPadding?: number;
}

export function ScreenShell({
  title,
  subtitle,
  children,
  headerRight,
  refreshing,
  onRefresh,
  bottomPadding = spacing.xxxl,
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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
        {headerRight}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.xl, flexGrow: 1 },
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
