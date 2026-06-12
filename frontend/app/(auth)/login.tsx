import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton, AppInput } from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { colors, radius, spacing } from "@/constants/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("unikoh@homehub.co.nz");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid email and password (min 4 characters).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to manage your properties and tenants.
          </Text>

          <View style={styles.form}>
            <AppInput
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.co.nz"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <AppInput
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={error ?? undefined}
            />
            <Pressable
              style={styles.forgot}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <AppButton title="Sign In" loading={loading} onPress={handleLogin} />

            <Pressable
              style={styles.demo}
              onPress={() => showToast("Demo mode — any details work")}
            >
              <Text style={styles.demoText}>
                Demo mode is on — tap Sign In to explore.
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to HomeHub? </Text>
          <Pressable onPress={() => router.replace("/(auth)/register")}>
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoText: { color: colors.white, fontSize: 30, fontWeight: "800" },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  form: { marginTop: spacing.sm },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: spacing.xl,
  },
  forgotText: { color: colors.primary, fontSize: 14, fontWeight: "600" },
  demo: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  demoText: { color: colors.textFaint, fontSize: 13 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
