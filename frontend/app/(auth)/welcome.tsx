import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "@/components";
import { colors, radius, spacing } from "@/constants/theme";

const FEATURES = [
  { icon: "home", label: "Manage every property in one place" },
  { icon: "wallet", label: "Track rent, bonds and payments" },
  { icon: "construct", label: "Handle maintenance with ease" },
  { icon: "chatbubbles", label: "Message tenants and contractors" },
] as const;

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      }}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.top}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.brand}>HomeHub NZ</Text>
          <Text style={styles.tagline}>
            The all-in-one property platform built for New Zealand.
          </Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>{f.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <AppButton
            title="Get Started"
            icon="arrow-forward"
            onPress={() => router.push("/(auth)/register")}
          />
          <View style={{ height: spacing.md }} />
          <AppButton
            title="I already have an account"
            variant="secondary"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.background },
  bgImage: { opacity: 0.35 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6, 13, 31, 0.78)",
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: "space-between",
  },
  top: {
    marginTop: spacing.xxxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  logoText: { color: colors.white, fontSize: 36, fontWeight: "800" },
  brand: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 25,
    marginTop: spacing.md,
    maxWidth: 320,
  },
  features: {
    gap: spacing.lg,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  actions: {
    marginBottom: spacing.lg,
  },
});
