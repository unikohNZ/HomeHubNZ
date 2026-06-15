import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BrandLogo } from "./BrandLogo";
import { BRAND_COLORS, BRAND_TAGLINE } from "../constants/branding";
import { spacing } from "../constants/design";

export function BrandSplash() {
  return (
    <LinearGradient
      colors={[BRAND_COLORS.secondary, BRAND_COLORS.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.orbA} />
      <View style={styles.orbB} />
      <View style={styles.content}>
        <BrandLogo variant="icon" size="large" />
        <Text style={styles.title}>HomeHub NZ</Text>
        <Text style={styles.subtitle}>{BRAND_TAGLINE}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  orbA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    top: -40,
    left: -60,
  },
  orbB: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(4, 20, 45, 0.08)",
    bottom: 60,
    right: -40,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginTop: spacing.lg,
    fontSize: 32,
    fontWeight: "800",
    color: BRAND_COLORS.navy,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(4, 20, 45, 0.75)",
    textAlign: "center",
  },
});
