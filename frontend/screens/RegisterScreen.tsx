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

const ROLES = [
  {
    id: "flatmate" as const,
    emoji: "🏠",
    label: "Flatmate",
    hint: "Share a flat, split bills & stay organised",
  },
  {
    id: "landlord" as const,
    emoji: "🔑",
    label: "Landlord",
    hint: "Manage properties, tenants & rent",
  },
];

export function RegisterScreen() {
  const navigation = useAuthFlowNavigation();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"flatmate" | "landlord">("flatmate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        phone,
        password,
        role,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGradientLayout>
      <AuthBrandHeader />

      <AuthCard>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Set up your profile as a flatmate or landlord.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Alex"
              placeholderTextColor={authColors.placeholder}
              autoComplete="given-name"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Taylor"
              placeholderTextColor={authColors.placeholder}
              autoComplete="family-name"
            />
          </View>
        </View>

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

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="+64 21 000 0000"
          placeholderTextColor={authColors.placeholder}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          placeholderTextColor={authColors.placeholder}
        />

        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder="Re-enter password"
          placeholderTextColor={authColors.placeholder}
        />

        <Text style={styles.label}>I am a</Text>
        <View style={styles.roleList}>
          {ROLES.map((r) => {
            const active = role === r.id;
            return (
              <Pressable
                key={r.id}
                style={[styles.roleCard, active && styles.roleCardActive]}
                onPress={() => setRole(r.id)}
              >
                <Text style={styles.roleEmoji}>{r.emoji}</Text>
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={[styles.roleHint, active && styles.roleHintActive]}>
                    {r.hint}
                  </Text>
                </View>
                <View style={[styles.roleRadio, active && styles.roleRadioActive]}>
                  {active && <View style={styles.roleRadioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.primaryBtn, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginBold}>Login</Text>
          </Text>
        </Pressable>
      </AuthCard>

      <Text style={styles.trust}>
        Built for New Zealand flatmates, tenants and landlords.
      </Text>
    </AuthGradientLayout>
  );
}

const styles = StyleSheet.create({
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: { flex: 1 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: authColors.label,
    marginBottom: 6,
  },
  input: {
    ...authInput,
    marginBottom: spacing.md,
  },
  roleList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: authColors.inputBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: authColors.inputBg,
  },
  roleCardActive: {
    borderColor: authColors.primary,
    backgroundColor: "rgba(79, 140, 255, 0.08)",
  },
  roleEmoji: { fontSize: 28 },
  roleInfo: { flex: 1 },
  roleLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: authColors.navy,
  },
  roleLabelActive: { color: authColors.primary },
  roleHint: {
    fontSize: 12,
    color: authColors.muted,
    marginTop: 2,
    lineHeight: 16,
    fontWeight: "500",
  },
  roleHintActive: { color: "#3B6FD4" },
  roleRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: authColors.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  roleRadioActive: {
    borderColor: authColors.primary,
  },
  roleRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: authColors.primary,
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
  loginLink: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  loginText: {
    fontSize: 14,
    color: authColors.muted,
    fontWeight: "500",
  },
  loginBold: {
    color: authColors.primary,
    fontWeight: "800",
  },
  errorBox: {
    backgroundColor: authColors.errorBg,
    borderRadius: radius.md,
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
  trust: {
    fontSize: 12,
    color: "rgba(4, 20, 45, 0.65)",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
