import { ReactNode } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing, typography } from "../constants/design";

interface SubScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  headerRight?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function SubScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  headerRight,
  refreshing,
  onRefresh,
}: SubScreenLayoutProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={onBack} style={styles.back} hitSlop={12}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </Pressable>
        {headerRight}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        )}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  back: { paddingVertical: spacing.sm, minHeight: 44, justifyContent: "center" },
  backText: { fontSize: 15, fontWeight: "700" },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.title, color: "#fff" },
  subtitle: { fontSize: 14, marginBottom: spacing.lg, lineHeight: 20 },
});
