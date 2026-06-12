import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppCard, ScreenHeader } from "@/components";
import { colors, radius, spacing } from "@/constants/theme";

interface ToggleSetting {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
}

const PREFERENCES: ToggleSetting[] = [
  { icon: "notifications", label: "Push Notifications", description: "Rent, maintenance and message alerts", color: colors.primary },
  { icon: "mail", label: "Email Updates", description: "Weekly summaries and receipts", color: colors.success },
  { icon: "moon", label: "Dark Mode", description: "Currently always on", color: colors.purple },
  { icon: "finger-print", label: "Biometric Login", description: "Use Face ID / fingerprint", color: colors.warning },
];

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<boolean[]>([true, true, true, false]);

  const setAt = (index: number, value: boolean) =>
    setToggles((prev) => prev.map((v, i) => (i === index ? value : v)));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Settings" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.section}>Preferences</Text>
        <AppCard padded={false} style={styles.card}>
          {PREFERENCES.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.row,
                index < PREFERENCES.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={[styles.icon, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.body}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <Switch
                value={toggles[index]}
                onValueChange={(v) => setAt(index, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          ))}
        </AppCard>

        <Text style={styles.section}>Account</Text>
        <AppCard padded={false} style={styles.card}>
          {["Edit Profile", "Change Password", "Linked Accounts", "Delete Account"].map(
            (label, index, arr) => (
              <View
                key={label}
                style={[styles.row, index < arr.length - 1 && styles.rowBorder]}
              >
                <Text
                  style={[
                    styles.linkLabel,
                    label === "Delete Account" && { color: colors.dangerText },
                  ]}
                >
                  {label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textFaint}
                />
              </View>
            ),
          )}
        </AppCard>

        <Text style={styles.section}>About</Text>
        <AppCard style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>HomeHub NZ</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutText}>
            Built for New Zealand landlords, property managers and tenants.
            Manage properties, rent, maintenance and communication in one place.
          </Text>
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  section: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  card: { marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  label: { color: colors.text, fontSize: 15, fontWeight: "600" },
  description: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  linkLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "500" },
  aboutCard: { alignItems: "center" },
  aboutTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  aboutVersion: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
