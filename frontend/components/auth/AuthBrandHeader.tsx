import { StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "./BrandLogo";
import { BRAND_TAGLINE } from "../constants/branding";
import { authColors } from "./auth/authTheme";
import { spacing } from "../constants/design";

interface AuthBrandHeaderProps {
  centered?: boolean;
}

export function AuthBrandHeader({ centered = true }: AuthBrandHeaderProps) {
  return (
    <View style={[styles.wrap, centered && styles.centered]}>
      <BrandLogo variant="light" size="large" />
      <Text style={styles.brand}>HomeHub NZ</Text>
      <Text style={styles.tagline}>{BRAND_TAGLINE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  centered: { alignItems: "center" },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: authColors.navy,
    letterSpacing: -0.6,
    marginTop: spacing.md,
    textAlign: "center",
  },
  tagline: {
    fontSize: 15,
    color: "rgba(4, 20, 45, 0.72)",
    marginTop: 6,
    fontWeight: "600",
    textAlign: "center",
  },
});
