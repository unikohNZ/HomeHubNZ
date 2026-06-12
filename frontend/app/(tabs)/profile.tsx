import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppCard, Avatar, Badge } from "@/components";
import { useAuth } from "@/context/AuthContext";
import {
  useMaintenance,
  useProperties,
  useRentPayments,
} from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import { initials, titleCase } from "@/utils/format";

const MENU: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href?: Href;
  color: string;
}[] = [
  { icon: "notifications-outline", label: "Notifications", href: "/notifications", color: colors.primary },
  { icon: "settings-outline", label: "Settings", href: "/settings", color: colors.textSecondary },
  { icon: "card-outline", label: "Payment Methods", color: colors.success },
  { icon: "document-text-outline", label: "Documents", color: colors.warning },
  { icon: "shield-checkmark-outline", label: "Privacy & Security", color: colors.purple },
  { icon: "help-circle-outline", label: "Help & Support", color: colors.teal },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { data: properties } = useProperties();
  const { data: payments } = useRentPayments();
  const { data: maintenance } = useMaintenance();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Profile</Text>

        <AppCard elevated style={styles.profileCard}>
          <Avatar
            label={initials(user?.first_name ?? "U", user?.last_name)}
            size={72}
          />
          <Text style={styles.name}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <Badge
              label={titleCase(user?.role ?? "tenant")}
              bg={colors.primaryMuted}
              text={colors.primary}
            />
            {user?.is_verified && (
              <Badge
                label="Verified"
                bg={colors.successMuted}
                text={colors.successText}
              />
            )}
          </View>
        </AppCard>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{properties?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{payments?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Payments</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{maintenance?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
        </View>

        <AppCard padded={false} style={styles.menu}>
          {MENU.map((item, index) => (
            <Pressable
              key={item.label}
              style={[
                styles.menuItem,
                index < MENU.length - 1 && styles.menuBorder,
              ]}
              onPress={() => item.href && router.push(item.href)}
            >
              <View
                style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}
              >
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textFaint}
              />
            </Pressable>
          ))}
        </AppCard>

        <Pressable style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.dangerText} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>HomeHub NZ · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    paddingVertical: spacing.lg,
  },
  profileCard: { alignItems: "center", marginBottom: spacing.lg },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: spacing.md,
  },
  email: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  badgeRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  menu: { marginBottom: spacing.lg },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "500" },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.md,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  logoutText: { color: colors.dangerText, fontSize: 15, fontWeight: "700" },
  version: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
