import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppButton, AppInput, ScreenHeader } from "@/components";
import { authService } from "@/services/authService";
import { colors, radius, spacing } from "@/constants/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    await authService.forgotPassword(email.trim());
    setLoading(false);
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Reset password" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          {sent ? (
            <View style={styles.success}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={36} color={colors.success} />
              </View>
              <Text style={styles.title}>Check your inbox</Text>
              <Text style={styles.subtitle}>
                We&apos;ve sent password reset instructions to{"\n"}
                <Text style={{ color: colors.text }}>{email}</Text>
              </Text>
              <View style={styles.action}>
                <AppButton
                  title="Back to sign in"
                  onPress={() => router.replace("/(auth)/login")}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.iconWrap}>
                <Ionicons name="key-outline" size={28} color={colors.primary} />
              </View>
              <Text style={styles.title}>Forgot your password?</Text>
              <Text style={styles.subtitle}>
                Enter your email and we&apos;ll send you a secure link to reset
                it.
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
                  error={error ?? undefined}
                />
                <AppButton
                  title="Send reset link"
                  loading={loading}
                  onPress={handleSubmit}
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  form: { marginTop: spacing.xxl },
  success: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xxxl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.successMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  action: { marginTop: spacing.xxl, width: "100%" },
});
