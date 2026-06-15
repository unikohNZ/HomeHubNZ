import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthFlowNavigation } from "../contexts/AuthFlowContext";
import { AuthBrandHeader } from "../components/auth/AuthBrandHeader";
import { AuthCard } from "../components/auth/AuthCard";
import { authButton, authColors, authInput } from "../components/auth/authTheme";
import { AuthGradientLayout } from "../components/AuthGradientLayout";
import { useAuth } from "../contexts/AuthContext";
import { radius, spacing } from "../constants/design";

export function ForgotPasswordScreen() {
  const navigation = useAuthFlowNavigation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    await forgotPassword(email.trim());
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthGradientLayout>
      <AuthBrandHeader />

      <AuthCard style={styles.cardTop}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we will send a reset link (demo mode).
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              If an account exists for {email}, a reset link has been sent.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@homehub.co.nz"
              placeholderTextColor={authColors.placeholder}
            />
            <Pressable
              style={[styles.primaryBtn, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Send Reset Link</Text>
              )}
            </Pressable>
          </>
        )}

        <Pressable style={styles.backLink} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
      </AuthCard>
    </AuthGradientLayout>
  );
}

const styles = StyleSheet.create({
  cardTop: { marginTop: spacing.lg },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: authColors.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: authColors.muted,
    marginTop: 6,
    marginBottom: spacing.lg,
    lineHeight: 20,
    fontWeight: "500",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: authColors.label,
    marginBottom: 6,
  },
  input: {
    ...authInput,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    ...authButton,
    backgroundColor: authColors.primary,
    marginBottom: spacing.md,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backLink: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  backText: {
    color: authColors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  successBox: {
    backgroundColor: authColors.successBg,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: spacing.lg,
  },
  successText: {
    color: authColors.successText,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  disabled: { opacity: 0.7 },
});
