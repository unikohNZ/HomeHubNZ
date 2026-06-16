import { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { OfflineBanner } from "../components/OfflineBanner";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/SectionHeader";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { BRAND_TAGLINE } from "../constants/branding";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { DemoRole, SubScreen } from "../types";
import { radius, spacing, touchTarget } from "../constants/design";
import { pickProfileImage } from "../utils/imagePicker";

const PROFILE_PHOTO_SIZE = 96;

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
  backendOffline?: boolean;
  onRetryBackend?: () => void;
  onToggleTheme: () => void;
  onSwitchRole: (role: DemoRole) => void;
  onNavigate: (screen: SubScreen) => void;
  onNavigateMyFlat?: () => void;
}

export function ProfileScreen({
  role,
  propertyCount,
  paymentCount,
  requestCount,
  unreadNotifications,
  isDark,
  backendOffline,
  onRetryBackend,
  onToggleTheme,
  onSwitchRole,
  onNavigate,
  onNavigateMyFlat,
}: ProfileScreenProps) {
  const { theme } = useTheme();
  const { user: authUser, logout } = useAuth();
  const user = authUser ?? (role === "landlord" ? LANDLORD_USER : FLATMATE_USER);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const handleChangePhoto = async () => {
    if (pickingPhoto) return;

    setPickingPhoto(true);
    try {
      const uri = await pickProfileImage();
      if (uri) {
        setProfilePhotoUri(uri);
      }
    } finally {
      setPickingPhoto(false);
    }
  };

  const accountItems = [
    { icon: "🔔", label: "Notifications", screen: "notifications" as SubScreen, badge: unreadNotifications },
    { icon: "📄", label: "Documents", screen: "documents" as SubScreen },
    { icon: "🔒", label: "Privacy", screen: "agreement" as SubScreen },
  ];

  const householdItems: Array<
    | { icon: string; label: string; action: () => void }
    | { icon: string; label: string; screen: SubScreen }
  > = [
    { icon: "🏠", label: "My Flat", action: () => onNavigateMyFlat?.() },
    { icon: "📋", label: "House Rules", screen: "house-rules" },
    { icon: "🆘", label: "Emergency Contacts", screen: "emergency-hub" },
  ];

  const appItems = [
    { icon: "ℹ️", label: "About HomeHub NZ", screen: "about" as SubScreen },
    { icon: "📜", label: "Terms", screen: "agreement" as SubScreen },
    { icon: "🔐", label: "Privacy Policy", screen: "agreement" as SubScreen },
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
        <View style={[styles.profile, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.avatarColumn}>
            {profilePhotoUri ? (
              <Image
                source={{ uri: profilePhotoUri }}
                style={[
                  styles.profilePhoto,
                  { borderColor: theme.border, backgroundColor: theme.cardElevated },
                ]}
                resizeMode="cover"
                accessibilityLabel="Profile photo"
              />
            ) : (
              <View
                style={[
                  styles.profilePhoto,
                  styles.profilePhotoFallback,
                  { backgroundColor: user.avatar_color, borderColor: theme.border },
                ]}
              >
                <Text style={styles.profileInitials}>UG</Text>
              </View>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.changePhotoBtn,
                { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
                pressed && styles.changePhotoPressed,
              ]}
              onPress={handleChangePhoto}
              disabled={pickingPhoto}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {pickingPhoto ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change Photo</Text>
              )}
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
            <Badge
              label={role === "landlord" ? "Landlord" : "Flatmate"}
              tone="primary"
              style={{ marginTop: spacing.sm, alignSelf: "flex-start" }}
            />
            {user.verified && (
              <Badge label="✓ Verified" tone="success" style={{ marginTop: spacing.sm, alignSelf: "flex-start" }} />
            )}
          </View>
        </View>

        <SectionHeader title="Account" />
        {accountItems.map((item) => (
          <ProfileRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            onPress={() => onNavigate(item.screen)}
          />
        ))}
        <ProfileRow
          icon={isDark ? "🌙" : "☀️"}
          label="Settings"
          value={isDark ? "Dark mode" : "Light mode"}
          onPress={onToggleTheme}
        />

        <SectionHeader title="Household" />
        {householdItems.map((item) => (
          <ProfileRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            onPress={"action" in item ? item.action : () => onNavigate(item.screen)}
          />
        ))}

        <SectionHeader title="App" />
        {appItems.map((item) => (
          <ProfileRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            onPress={() => onNavigate(item.screen)}
          />
        ))}
        <View style={[styles.versionRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>📱 Version</Text>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>v1.0.0</Text>
        </View>
        <Text style={[styles.footer, { color: theme.textMuted }]}>{BRAND_TAGLINE}</Text>

        <SectionHeader title="Demo / Developer" />
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
        {backendOffline && (
          <OfflineBanner isOffline onRetry={onRetryBackend} />
        )}

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

function ProfileRow({
  icon,
  label,
  value,
  badge,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  badge?: number;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <Text style={[styles.rowLabel, { color: theme.text }]}>
        {icon} {label}
      </Text>
      {badge !== undefined && badge > 0 ? (
        <Badge label={String(badge)} tone="danger" />
      ) : value ? (
        <Text style={[styles.rowValue, { color: theme.textMuted }]}>{value}</Text>
      ) : (
        <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarColumn: {
    alignItems: "center",
    gap: spacing.sm,
  },
  profilePhoto: {
    width: PROFILE_PHOTO_SIZE,
    height: PROFILE_PHOTO_SIZE,
    borderRadius: PROFILE_PHOTO_SIZE / 2,
    borderWidth: 2,
  },
  profilePhotoFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  changePhotoBtn: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  changePhotoPressed: { opacity: 0.85 },
  changePhotoText: { fontSize: 12, fontWeight: "700" },
  profileInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "800" },
  email: { fontSize: 14, marginTop: 4 },
  versionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: touchTarget,
  },
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
