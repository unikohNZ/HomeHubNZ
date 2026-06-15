import { StyleSheet, Text, View } from "react-native";
import { AuthCard } from "./auth/AuthCard";
import { authColors } from "./auth/authTheme";
import { spacing } from "../constants/design";

export function AuthWelcomeCard() {
  return (
    <AuthCard>
      <Text style={styles.title}>Welcome back 👋</Text>
      <Text style={styles.subtitle}>
        Sign in to manage your flat, rent, bills, and messages.
      </Text>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: authColors.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: authColors.muted,
    marginTop: spacing.sm,
    lineHeight: 21,
    fontWeight: "500",
  },
});
