import { StyleSheet, Text, View } from "react-native";
import { BrandLogo, type BrandLogoVariant } from "./BrandLogo";
import { useTheme } from "../context/ThemeContext";
import { spacing } from "../constants/design";

interface BrandHeaderProps {
  variant?: BrandLogoVariant;
  subtitle?: string;
  badgeCount?: number;
  compact?: boolean;
}

export function BrandHeader({
  variant = "icon",
  subtitle,
  badgeCount,
  compact = false,
}: BrandHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <BrandLogo variant={variant} size={compact ? "small" : "medium"} />
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]}>HomeHub NZ</Text>
            {badgeCount !== undefined && badgeCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                <Text style={styles.badgeText}>
                  {badgeCount > 99 ? "99+" : badgeCount}
                </Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  textCol: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { fontSize: 14, marginTop: 2, lineHeight: 20, fontWeight: "500" },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
});
