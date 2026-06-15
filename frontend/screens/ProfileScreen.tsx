import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { ScreenShell } from "../components/ScreenShell";
import { UserAvatar } from "../components/UserAvatar";
import { Badge } from "../components/ui/Badge";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { BRAND_TAGLINE } from "../constants/branding";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { DemoRole, SubScreen } from "../types";
import { radius, spacing, touchTarget } from "../constants/design";

const SIGN_OUT_BG = "#7F1D1D";
const SIGN_OUT_BORDER = "#EF4444";
const TAB_BAR_CLEARANCE = 120;

interface ProfileScreenProps {
  role: DemoRole;
  propertyCount: number;
  paymentCount: number;
  requestCount: number;
  unreadNotifications: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onSwitchRole: (role: DemoRole) => void;
  onNavigate: (screen: SubScreen) => void;
}

export function ProfileScreen({
  role,
  propertyCount,
  paymentCount,
  requestCount,
  unreadNotifications,
  isDark,
  onToggleTheme,
  onSwitchRole,
  onNavigate,
}: ProfileScreenProps) {
  const { theme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const user = authUser ?? (role === "landlord" ? LANDLORD_USER : FLATMATE_USER);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const menuItems: { icon: string; label: string; screen: SubScreen; badge?: number }[] = [
    { icon: "🔔", label: "Notifications", screen: "notifications", badge: unreadNotifications },
    { icon: "ℹ️", label: "About HomeHub NZ", screen: "about" },
    { icon: "📄", label: "Documents", screen: "documents" },
    { icon: "🆘", label: "Emergency Contacts", screen: "emergency-hub" },
    { icon: "📋", label: "House Rules", screen: "house-rules" },
    { icon: "🔒", label: "Privacy", screen: "agreement" },
  ];

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await logout();
  };

  return (
    <>
      <ScreenShell
        title="Profile"
        subtitle="Account & preferences"
        bottomPadding={TAB_BAR_CLEARANCE}
      >
        <View style={[styles.brandBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <BrandLogo variant="icon" size="medium" />
          <Text style={[styles.brandName, { color: theme.text }]}>HomeHub NZ</Text>
          <Text style={[styles.version, { color: theme.textMuted }]}>v1.0.0</Text>
        </View>

        <View style={[styles.profile, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <UserAvatar name={user.name} color={user.avatar_color} size={72} />
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
            {user.verified && (
              <Badge label="✓ Verified" tone="success" style={{ marginTop: spacing.sm }} />
            )}
          </View>
        </View>

        <View style={styles.stats}>
          <StatBox label="Properties" value={String(propertyCount)} />
          <StatBox label="Payments" value={String(paymentCount)} />
          <StatBox label="Requests" value={String(requestCount)} />
        </View>

        <SectionHeader title="Settings" />
        {menuItems.map((item) => (
          <Pressable
            key={item.screen}
            style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => onNavigate(item.screen)}
          >
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              {item.icon} {item.label}
            </Text>
            {item.badge !== undefined && item.badge > 0 ? (
              <Badge label={String(item.badge)} tone="danger" />
            ) : (
              <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
            )}
          </Pressable>
        ))}

        <Pressable
          style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onToggleTheme}
        >
          <Text style={[styles.rowLabel, { color: theme.text }]}>
            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </Text>
          <Text style={[styles.rowValue, { color: theme.primary }]}>{isDark ? "On" : "Off"}</Text>
        </Pressable>

        <SectionHeader title="Switch Role" />
        <View style={[styles.roleSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.roleSub, { color: theme.textSecondary }]}>
            Preview flatmate or landlord experience
          </Text>
          <View style={styles.roleRow}>
            <Pressable
              style={[
                styles.roleBtn,
                {
                  backgroundColor: role === "flatmate" ? theme.primary : theme.primaryMuted,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => onSwitchRole("flatmate")}
            >
              <Text style={[styles.roleBtnText, { color: role === "flatmate" ? "#fff" : theme.primary }]}>
                Flatmate
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.roleBtn,
                {
                  backgroundColor: role === "landlord" ? theme.primary : theme.primaryMuted,
                  borderColor: theme.primary,
                },
              ]}
              onPress={() => onSwitchRole("landlord")}
            >
              <Text style={[styles.roleBtnText, { color: role === "landlord" ? "#fff" : theme.primary }]}>
                Landlord
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          {BRAND_TAGLINE}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && styles.signOutPressed,
          ]}
          onPress={() => setShowSignOutModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScreenShell>

      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowSignOutModal(false)}
            accessibilityLabel="Dismiss sign out dialog"
          />
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Sign Out</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
              Are you sure you want to sign out?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalCancel, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
                onPress={() => setShowSignOutModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSignOut} onPress={confirmSignOut}>
                <Text style={styles.modalSignOutText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  brandBlock: {
    alignItems: "center",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: spacing.md,
    letterSpacing: -0.3,
  },
  version: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "800" },
  email: { fontSize: 14, marginTop: 4 },
  stats: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  stat: { flex: 1, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: touchTarget,
  },
  rowLabel: { fontSize: 15, fontWeight: "600" },
  rowValue: { fontSize: 14, fontWeight: "600" },
  chevron: { fontSize: 20, fontWeight: "300" },
  roleSection: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  roleSub: { fontSize: 13, marginBottom: spacing.md },
  roleRow: { flexDirection: "row", gap: spacing.md },
  roleBtn: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  roleBtnText: { fontSize: 14, fontWeight: "700" },
  footer: { textAlign: "center", fontSize: 12, marginTop: spacing.lg, marginBottom: spacing.xl },
  signOutBtn: {
    width: "100%",
    backgroundColor: SIGN_OUT_BG,
    borderWidth: 1,
    borderColor: SIGN_OUT_BORDER,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTarget,
    marginTop: spacing.sm,
  },
  signOutPressed: { opacity: 0.9 },
  signOutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  modalActions: { flexDirection: "row", gap: spacing.md },
  modalCancel: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: touchTarget,
    justifyContent: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "700" },
  modalSignOut: {
    flex: 1,
    backgroundColor: SIGN_OUT_BG,
    borderWidth: 1,
    borderColor: SIGN_OUT_BORDER,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: touchTarget,
    justifyContent: "center",
  },
  modalSignOutText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
