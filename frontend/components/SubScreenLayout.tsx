import { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface SubScreenLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function SubScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  headerRight,
}: SubScreenLayoutProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
        </Pressable>
        {headerRight}
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  back: { paddingVertical: 8 },
  backText: { fontSize: 15, fontWeight: "600" },
  content: { padding: 20, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
});
