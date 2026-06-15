import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { BRAND_ASSETS } from "../../constants/branding";
import { radius, spacing } from "../../constants/design";

export type AlertLevel = "normal" | "watch" | "emergency";

interface AlertStatusBannerProps {
  level: AlertLevel;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

const CONFIG: Record<AlertLevel, { label: string; useMascot: boolean }> = {
  normal: { label: "Normal", useMascot: false },
  watch: { label: "Watch", useMascot: true },
  emergency: { label: "Emergency", useMascot: true },
};

function AlertIcon({ level }: { level: AlertLevel }) {
  const cfg = CONFIG[level];
  if (cfg.useMascot) {
    return (
      <Image
        source={BRAND_ASSETS.icon}
        style={styles.mascot}
        resizeMode="cover"
        accessibilityLabel="HomeHub emergency alert"
      />
    );
  }
  return <Text style={styles.icon}>✅</Text>;
}

export function AlertStatusBanner({ level, title, subtitle, onPress }: AlertStatusBannerProps) {
  const { theme } = useTheme();
  const colors = {
    normal: { bg: theme.successMuted, border: theme.success, text: theme.success },
    watch: { bg: theme.warningMuted, border: theme.warning, text: theme.warning },
    emergency: { bg: theme.dangerMuted, border: theme.danger, text: theme.danger },
  }[level];
  const cfg = CONFIG[level];

  const content = (
    <View style={[styles.banner, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <AlertIcon level={level} />
      <View style={styles.flex}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.sub, { color: theme.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      <View style={[styles.pill, { backgroundColor: colors.border + "33" }]}>
        <Text style={[styles.pillText, { color: colors.text }]}>{cfg.label}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 24 },
  mascot: { width: 36, height: 36, borderRadius: 10 },
  flex: { flex: 1 },
  title: { fontSize: 15, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "800" },
});
