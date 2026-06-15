import { StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { BRAND_TAGLINE } from "../constants/branding";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";

interface AboutScreenProps {
  onBack: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="About" subtitle="HomeHub NZ" onBack={onBack}>
      <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <BrandLogo variant="light" size="large" />
        <Text style={[styles.brand, { color: theme.text }]}>HomeHub NZ</Text>
        <Text style={[styles.tagline, { color: theme.primary }]}>{BRAND_TAGLINE}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          HomeHub NZ helps flatmates, tenants and landlords manage rent, bills,
          maintenance, messages, emergency alerts and household life in one place.
        </Text>
      </View>

      <View style={[styles.meta, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
        <Text style={[styles.metaLabel, { color: theme.textMuted }]}>Version</Text>
        <Text style={[styles.metaValue, { color: theme.text }]}>v1.0.0</Text>
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>
        Made in Aotearoa 🇳🇿
      </Text>
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  brand: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: spacing.md,
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: spacing.sm,
    textAlign: "center",
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },
  meta: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  metaLabel: { fontSize: 14, fontWeight: "600" },
  metaValue: { fontSize: 14, fontWeight: "800" },
  footer: { textAlign: "center", fontSize: 13, fontWeight: "600" },
});
