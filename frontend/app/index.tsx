import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors, radius } from "@/constants/theme";

const SPLASH_MIN_MS = 1200;

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(t);
  }, []);

  if (isLoading || !splashDone) {
    return (
      <View style={styles.container}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>H</Text>
        </View>
        <Text style={styles.brand}>HomeHub NZ</Text>
        <Text style={styles.tagline}>Property management, sorted.</Text>
        <ActivityIndicator
          color={colors.primary}
          style={styles.spinner}
          size="small"
        />
      </View>
    );
  }

  return (
    <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/welcome"} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoText: {
    color: colors.white,
    fontSize: 48,
    fontWeight: "800",
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
  },
  spinner: {
    marginTop: 40,
  },
});
