import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AuthAnimatedPressable } from "../components/auth/AuthAnimatedPressable";
import { AuthBrandHeader } from "../components/auth/AuthBrandHeader";
import { AuthDemoAccounts } from "../components/auth/AuthDemoAccounts";
import { AuthInputField } from "../components/auth/AuthInputField";
import { authColors } from "../components/auth/authTheme";
import { AuthGradientLayout } from "../components/AuthGradientLayout";
import { useAuthFlowNavigation } from "../contexts/AuthFlowContext";
import { DEMO_FLATMATE_EMAIL, DEMO_PASSWORD } from "../data/demoAccounts";
import { useAuth } from "../contexts/AuthContext";
import { spacing, touchTarget } from "../constants/design";

const CARD_RADIUS = 28;

export function LoginScreen() {
  const navigation = useAuthFlowNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState(DEMO_FLATMATE_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-16)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(logoY, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.spring(cardY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [cardOpacity, cardY, logoOpacity, logoY]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password, rememberMe);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    setError(`${provider} sign in is not configured in demo mode.`);
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <AuthGradientLayout>
      <Animated.View
        style={{
          opacity: logoOpacity,
          transform: [{ translateY: logoY }],
        }}
      >
        <AuthBrandHeader />
      </Animated.View>

      <Animated.View
        style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardY }],
        }}
      >
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your household hub</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AuthInputField
            icon="✉️"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@homehub.co.nz"
          />

          <AuthInputField
            icon="🔒"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            placeholder="Enter your password"
          />

          <View style={styles.rememberRow}>
            <Pressable
              style={styles.rememberLeft}
              onPress={() => setRememberMe((v) => !v)}
              hitSlop={8}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("ForgotPassword")} hitSlop={8}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </Pressable>
          </View>

          <AuthAnimatedPressable
            style={[styles.primaryBtn, loading && styles.disabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Login</Text>
            )}
          </AuthAnimatedPressable>

          <AuthAnimatedPressable
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.secondaryText}>Create Account</Text>
          </AuthAnimatedPressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.line} />
          </View>

          <AuthAnimatedPressable
            style={styles.socialBtn}
            onPress={() => handleSocial("Google")}
          >
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.socialText}>Continue with Google</Text>
          </AuthAnimatedPressable>

          {Platform.OS === "ios" && (
            <AuthAnimatedPressable
              style={styles.socialBtn}
              onPress={() => handleSocial("Apple")}
            >
              <Text style={styles.googleG}>{"\uF8FF"}</Text>
              <Text style={styles.socialText}>Continue with Apple</Text>
            </AuthAnimatedPressable>
          )}
        </View>

        <AuthDemoAccounts onSelect={fillDemo} />

        <Text style={styles.footer}>
          Built for New Zealand flatmates, tenants and landlords.
        </Text>
      </Animated.View>
    </AuthGradientLayout>
  );
}

const styles = StyleSheet.create({
  loginCard: {
    backgroundColor: authColors.card,
    borderRadius: CARD_RADIUS,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    marginBottom: spacing.lg,
    shadowColor: "#04142D",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: "rgba(4, 20, 45, 0.06)",
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: authColors.navy,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: authColors.muted,
    marginTop: 4,
    marginBottom: spacing.lg,
    fontWeight: "500",
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    minHeight: touchTarget,
  },
  rememberLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: authColors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: authColors.card,
  },
  checkboxOn: { backgroundColor: authColors.primary },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: -1,
  },
  rememberText: {
    fontSize: 14,
    color: authColors.label,
    fontWeight: "600",
  },
  forgotLink: {
    fontSize: 14,
    color: authColors.primary,
    fontWeight: "700",
  },
  primaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: authColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    shadowColor: authColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: authColors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#FFD84D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryText: {
    color: authColors.navy,
    fontSize: 17,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: authColors.inputBorder,
  },
  dividerText: {
    fontSize: 12,
    color: authColors.placeholder,
    fontWeight: "600",
  },
  socialBtn: {
    height: 58,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: authColors.card,
    borderWidth: 1.5,
    borderColor: authColors.inputBorder,
    marginBottom: spacing.sm,
  },
  googleG: {
    fontSize: 17,
    fontWeight: "800",
    color: authColors.navy,
    width: 22,
    textAlign: "center",
  },
  socialText: {
    color: authColors.navy,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: authColors.errorBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: spacing.md,
  },
  errorText: {
    color: authColors.errorText,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  disabled: { opacity: 0.7 },
  footer: {
    fontSize: 12,
    color: "rgba(4, 20, 45, 0.62)",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
