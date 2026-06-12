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
import { colors, radius, spacing } from "@/constants/theme";
import { UserRole } from "@/types";
import { titleCase } from "@/utils/format";

const ROLES: UserRole[] = [
  "tenant",
  "flatmate",
  "landlord",
  "property_manager",
  "contractor",
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("tenant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!firstName.trim() || !email.includes("@") || password.length < 6) {
      setError("Please complete all fields. Password needs 6+ characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.replace("/(tabs)");
    } catch {
      setError("Unable to create account. Please try again.");
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Join thousands of Kiwis managing property the smart way.
          </Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <AppInput
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Unikoh"
              />
            </View>
            <View style={styles.half}>
              <AppInput
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Walker"
              />
            </View>
          </View>

          <AppInput
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.co.nz"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            error={error ?? undefined}
          />

          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roles}>
            {ROLES.map((r) => (
              <Pressable
                key={r}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
                onPress={() => setRole(r)}
              >
                <Text
                  style={[
                    styles.roleText,
                    role === r && styles.roleTextActive,
                  ]}
                >
                  {titleCase(r)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <AppButton
              title="Create Account"
              loading={loading}
              onPress={handleRegister}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  roles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  roleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  roleText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  roleTextActive: { color: colors.primary },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  footerText: { color: colors.textMuted, fontSize: 14 },
  footerLink: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
