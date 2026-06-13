import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "../components/ScreenShell";
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../context/ThemeContext";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { DemoRole } from "../types";

interface ProfileScreenProps {
  role: DemoRole;
  propertyCount: number;
  paymentCount: number;
  requestCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onSwitchRole: (role: DemoRole) => void;
}

export function ProfileScreen({
  role,
  propertyCount,
  paymentCount,
  requestCount,
  isDark,
  onToggleTheme,
  onSwitchRole,
}: ProfileScreenProps) {
  const { theme } = useTheme();
  const user = role === "landlord" ? LANDLORD_USER : FLATMATE_USER;

  return (
    <ScreenShell title="Profile" subtitle="Account & preferences">
      <View style={[styles.profile, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <UserAvatar name={user.name} color={user.avatar_color} size={72} />
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.email, { color: theme.textMuted }]}>{user.email}</Text>
          <View style={[styles.verified, { backgroundColor: theme.successMuted }]}>
            <Text style={[styles.verifiedText, { color: theme.success }]}>
              {user.verified ? "✓ Verified" : "Unverified"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.stats}>
        <StatBox label="Properties" value={String(propertyCount)} />
        <StatBox label="Payments" value={String(paymentCount)} />
        <StatBox label="Requests" value={String(requestCount)} />
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Settings</Text>

      <Pressable
        style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onToggleTheme}
      >
        <Text style={[styles.rowLabel, { color: theme.text }]}>
          {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </Text>
        <Text style={[styles.rowValue, { color: theme.primary }]}>
          {isDark ? "On" : "Off"}
        </Text>
      </Pressable>

      <View style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>📍 Location</Text>
        <Text style={[styles.rowValue, { color: theme.textMuted }]}>{user.location}</Text>
      </View>

      <View style={[styles.roleSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.roleTitle, { color: theme.text }]}>
          Switch Demo Role
        </Text>
        <Text style={[styles.roleSub, { color: theme.textMuted }]}>
          For testing flatmate vs landlord experience
        </Text>
        <View style={styles.roleRow}>
          <Pressable
            style={[
              styles.roleBtn,
              {
                backgroundColor:
                  role === "flatmate" ? theme.primary : theme.primaryMuted,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => onSwitchRole("flatmate")}
          >
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "flatmate" ? "#fff" : theme.primary },
              ]}
            >
              Flatmate
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.roleBtn,
              {
                backgroundColor:
                  role === "landlord" ? theme.primary : theme.primaryMuted,
                borderColor: theme.primary,
              },
            ]}
            onPress={() => onSwitchRole("landlord")}
          >
            <Text
              style={[
                styles.roleBtnText,
                { color: role === "landlord" ? "#fff" : theme.primary },
              ]}
            >
              Landlord
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>
        HomeHub NZ v1.0 · Expo SDK 56
      </Text>
    </ScreenShell>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "800" },
  email: { fontSize: 14, marginTop: 4 },
  verified: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  verifiedText: { fontSize: 12, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 10, marginBottom: 16 },
  stat: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowValue: { fontSize: 14, fontWeight: "600" },
  roleSection: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  roleTitle: { fontSize: 15, fontWeight: "700" },
  roleSub: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  roleRow: { flexDirection: "row", gap: 10 },
  roleBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleBtnText: { fontSize: 14, fontWeight: "700" },
  footer: { textAlign: "center", fontSize: 12, marginTop: 24 },
});
