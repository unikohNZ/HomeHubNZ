import { Pressable, StyleSheet, Text, View } from "react-native";
import { DEMO_FLATMATE_EMAIL, DEMO_LANDLORD_EMAIL, DEMO_PASSWORD } from "../../data/demoAccounts";
import { authColors } from "./authTheme";
import { spacing } from "../../constants/design";

const ACCOUNTS = [
  { role: "Flatmate", email: DEMO_FLATMATE_EMAIL, password: DEMO_PASSWORD, emoji: "🏠" },
  { role: "Landlord", email: DEMO_LANDLORD_EMAIL, password: DEMO_PASSWORD, emoji: "🔑" },
];

interface AuthDemoAccountsProps {
  onSelect: (email: string, password: string) => void;
}

export function AuthDemoAccounts({ onSelect }: AuthDemoAccountsProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Try a demo account</Text>
      {ACCOUNTS.map((account) => (
        <Pressable
          key={account.role}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => onSelect(account.email, account.password)}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>{account.emoji}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.role}>{account.role}</Text>
            <Text style={styles.email}>{account.email}</Text>
            <Text style={styles.password}>{account.password}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#04142D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: "800",
    color: authColors.navy,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: authColors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: authColors.inputBorder,
  },
  rowPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(79, 140, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: { fontSize: 22 },
  info: { flex: 1 },
  role: {
    fontSize: 15,
    fontWeight: "800",
    color: authColors.navy,
  },
  email: {
    fontSize: 12,
    color: authColors.muted,
    marginTop: 2,
    fontWeight: "600",
  },
  password: {
    fontSize: 12,
    color: authColors.primary,
    marginTop: 2,
    fontWeight: "700",
    letterSpacing: 1,
  },
  chevron: {
    fontSize: 22,
    color: authColors.muted,
    fontWeight: "300",
  },
});
