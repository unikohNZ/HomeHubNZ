import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { OfflineBanner } from "../components/OfflineBanner";
import { ScreenShell } from "../components/ScreenShell";
import { Badge } from "../components/ui/Badge";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { BRAND_TAGLINE } from "../constants/branding";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { DemoRole, SubScreen } from "../types";
import { radius, spacing, touchTarget } from "../constants/design";
import { pickProfileImage } from "../utils/imagePicker";
import { initials } from "../utils/format";
import { useProfile, useUpdateProfile, useUploadAvatar } from "../src/services/profileService";
import { isMockMode } from "../src/utils/dataSource";

const PROFILE_PHOTO_SIZE = 96;
const SIGN_OUT_BG = "#7F1D1D";
const SIGN_OUT_BORDER = "#EF4444";
const TAB_BAR_CLEARANCE = 140;

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
  onBack: () => void;
  onGoHome: () => void;
}

type DetailModalContent = {
  title: string;
  icon: string;
  body: string;
};

export function ProfileScreen({
  role,
  unreadNotifications,
  isDark,
  backendOffline,
  onRetryBackend,
  onToggleTheme,
  onSwitchRole,
  onNavigate,
  onNavigateMyFlat,
  onBack,
  onGoHome,
}: ProfileScreenProps) {
  const { theme } = useTheme();
  const { user: authUser, logout, updateUser } = useAuth();
  const user = authUser ?? (role === "landlord" ? LANDLORD_USER : FLATMATE_USER);
  const profileQuery = useProfile(!isMockMode());
  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [detailModal, setDetailModal] = useState<DetailModalContent | null>(null);
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  const profilePhotoUri =
    localPhotoUri ?? user.avatar_url ?? profileQuery.data?.avatar_url ?? null;

  const openDetail = (content: DetailModalContent) => setDetailModal(content);

  const handleChangePhoto = async () => {
    if (pickingPhoto) return;

    setPickingPhoto(true);
    try {
      const uri = await pickProfileImage();
      if (!uri) return;

      setLocalPhotoUri(uri);

      if (!isMockMode()) {
        const updated = await uploadAvatar.mutateAsync({
          uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        });
        updateUser({ avatar_url: updated.avatar_url ?? uri });
        setLocalPhotoUri(null);
      }
    } finally {
      setPickingPhoto(false);
    }
  };

  const openEditProfile = () => {
    const profile = profileQuery.data;
    const nameParts = user.name.trim().split(/\s+/);
    setEditFirstName(profile?.first_name ?? nameParts[0] ?? "");
    setEditLastName(profile?.last_name ?? nameParts.slice(1).join(" ") ?? "");
    setEditPhone(profile?.phone ?? user.phone ?? "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim()) return;
    if (isMockMode()) {
      updateUser({
        name: `${editFirstName.trim()} ${editLastName.trim()}`.trim(),
        phone: editPhone.trim() || undefined,
      });
      setShowEditModal(false);
      return;
    }
    try {
      const updated = await updateProfile.mutateAsync({
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        phone: editPhone.trim() || undefined,
      });
      updateUser({
        name: `${updated.first_name} ${updated.last_name}`.trim(),
        phone: updated.phone ?? undefined,
      });
      setShowEditModal(false);
    } catch {
      // keep modal open
    }
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await logout();
  };

  const accountItems = [
    {
      icon: "✏️",
      label: "Edit Profile",
      description: "Update your name and contact details",
      onPress: openEditProfile,
    },
    {
      icon: "📷",
      label: "Change Profile Photo",
      description: "Upload a new profile picture",
      onPress: handleChangePhoto,
    },
    {
      icon: "🔔",
      label: "Notifications",
      description: "Alerts, rent reminders, and messages",
      badge: unreadNotifications,
      onPress: () =>
        onNavigate(role === "landlord" ? "landlord-notifications" : "notifications"),
    },
    {
      icon: "📄",
      label: "Documents",
      description: "Leases, receipts, and flat files",
      onPress: () => onNavigate("documents"),
    },
    {
      icon: "🔒",
      label: "Privacy & Security",
      description: "Data, permissions, and account safety",
      onPress: () => onNavigate("agreement"),
    },
  ];

  const appItems = [
    {
      icon: isDark ? "🌙" : "☀️",
      label: "Theme",
      description: "Switch between light and dark mode",
      value: isDark ? "Dark mode" : "Light mode",
      onPress: onToggleTheme,
    },
    {
      icon: "🌐",
      label: "Language",
      description: "App display language",
      value: "English (NZ)",
      onPress: () =>
        openDetail({
          icon: "🌐",
          title: "Language",
          body: "HomeHub NZ is currently available in English (New Zealand). More languages will be added in future updates.",
        }),
    },
    {
      icon: "ℹ️",
      label: "About HomeHub NZ",
      description: "Version, mission, and product info",
      onPress: () => onNavigate("about"),
    },
    {
      icon: "💬",
      label: "Help & Support",
      description: "FAQs, contact, and troubleshooting",
      onPress: () =>
        openDetail({
          icon: "💬",
          title: "Help & Support",
          body: "Need help with rent, your flat, or your account?\n\nEmail: support@homehub.co.nz\nHours: Mon–Fri, 9am–5pm NZST\n\nFor emergencies, use Emergency Contacts in Household Settings.",
        }),
    },
  ];

  const householdItems = [
    {
      icon: "🏠",
      label: "My Flat",
      description: "Your current flat and flatmates",
      onPress: () => onNavigateMyFlat?.(),
    },
    {
      icon: "📋",
      label: "House Rules",
      description: "Shared household agreements",
      onPress: () => onNavigate("house-rules"),
    },
    {
      icon: "🆘",
      label: "Emergency Contacts",
      description: "Quick access in an emergency",
      onPress: () => onNavigate("emergency-hub"),
    },
  ];

  return (
    <>
      <ScreenShell
        headerContent={
          <ProfileNavHeader
            onBack={onBack}
            onGoHome={onGoHome}
            theme={theme}
          />
        }
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
                <Text style={styles.profileInitials}>{initials(user.name)}</Text>
              </View>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.changePhotoBtn,
                { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
                pressed && styles.changePhotoPressed,
              ]}
              onPress={handleChangePhoto}
              disabled={pickingPhoto || uploadAvatar.isPending}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {pickingPhoto || uploadAvatar.isPending ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change Photo</Text>
              )}
            </Pressable>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
            {(user.phone ?? profileQuery.data?.phone) ? (
              <Text style={[styles.email, { color: theme.textSecondary }]}>
                {user.phone ?? profileQuery.data?.phone}
              </Text>
            ) : null}
            <Badge
              label={role === "landlord" ? "Landlord" : "Flatmate"}
              tone="primary"
              style={{ marginTop: spacing.sm, alignSelf: "flex-start" }}
            />
            {user.verified && (
              <Badge
                label="✓ Verified"
                tone="success"
                style={{ marginTop: spacing.sm, alignSelf: "flex-start" }}
              />
            )}
          </View>
        </View>

        <SettingsSection
          icon="👤"
          title="Account Settings"
          description="Manage your personal information"
          theme={theme}
        >
          {accountItems.map((item) => (
            <SettingRow key={item.label} {...item} theme={theme} />
          ))}
        </SettingsSection>

        <SettingsSection
          icon="⚙️"
          title="App Settings"
          description="Appearance and app preferences"
          theme={theme}
        >
          {appItems.map((item) => (
            <SettingRow key={item.label} {...item} theme={theme} />
          ))}
        </SettingsSection>

        <SettingsSection
          icon="🏡"
          title="Household Settings"
          description="Your flat and household tools"
          theme={theme}
        >
          {householdItems.map((item) => (
            <SettingRow key={item.label} {...item} theme={theme} />
          ))}
        </SettingsSection>

        <SettingsSection
          icon="🛠️"
          title="Developer / Demo"
          description="Preview roles and backend status"
          theme={theme}
        >
          <View style={[styles.roleSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.roleLabel, { color: theme.text }]}>Switch Role</Text>
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
          <SettingRow
            icon={backendOffline ? "🔴" : "🟢"}
            label="Backend Status"
            description={
              backendOffline
                ? "Offline — showing cached data"
                : isMockMode()
                  ? "Demo mode — mock data"
                  : "Connected to API"
            }
            value={backendOffline ? "Offline" : isMockMode() ? "Mock" : "Online"}
            onPress={() =>
              openDetail({
                icon: backendOffline ? "🔴" : "🟢",
                title: "Backend Status",
                body: backendOffline
                  ? "The backend is unreachable. Your last saved data is shown where available.\n\nTap Retry on the banner below to reconnect."
                  : isMockMode()
                    ? "Demo mode is active (EXPO_PUBLIC_USE_MOCK=true). Data is stored locally for preview."
                    : "Connected to the HomeHub NZ API. Changes are saved to your account.",
              })
            }
            theme={theme}
          />
        </SettingsSection>

        {backendOffline && <OfflineBanner isOffline onRetry={onRetryBackend} />}

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          {BRAND_TAGLINE} · v1.0.0
        </Text>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.signOutPressed]}
          onPress={() => setShowSignOutModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScreenShell>

      <DetailModal
        visible={!!detailModal}
        content={detailModal}
        theme={theme}
        onClose={() => setDetailModal(null)}
      />

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowEditModal(false)}
            accessibilityLabel="Dismiss edit profile dialog"
          />
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              placeholder="First name"
              placeholderTextColor={theme.textMuted}
              value={editFirstName}
              onChangeText={setEditFirstName}
            />
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              placeholder="Last name"
              placeholderTextColor={theme.textMuted}
              value={editLastName}
              onChangeText={setEditLastName}
            />
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
              placeholder="Phone"
              placeholderTextColor={theme.textMuted}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
                onPress={handleSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
              Are you sure you want to sign out? You will return to the login screen.
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

function ProfileNavHeader({
  onBack,
  onGoHome,
  theme,
}: {
  onBack: () => void;
  onGoHome: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={styles.navWrap}>
      <View style={styles.navRow}>
        <Pressable
          style={({ pressed }) => [
            styles.navBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.navBtnPressed,
          ]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.navBackText, { color: theme.primary }]}>← Back</Text>
        </Pressable>

        <View style={styles.navCenter}>
          <Text style={[styles.navTitle, { color: theme.text }]}>Profile</Text>
          <Text style={[styles.navSubtitle, { color: theme.textSecondary }]}>
            Account & settings
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.navIconBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.navBtnPressed,
          ]}
          onPress={onGoHome}
          accessibilityRole="button"
          accessibilityLabel="Go to home"
        >
          <Text style={styles.navHomeIcon}>🏠</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  theme,
  children,
}: {
  icon: string;
  title: string;
  description: string;
  theme: ReturnType<typeof useTheme>["theme"];
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <View style={styles.sectionText}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>{description}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function SettingRow({
  icon,
  label,
  description,
  value,
  badge,
  onPress,
  theme,
}: {
  icon: string;
  label: string;
  description?: string;
  value?: string;
  badge?: number;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.settingRowPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <View style={styles.settingBody}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
        {description ? (
          <Text style={[styles.settingDesc, { color: theme.textMuted }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
      <View style={styles.settingTrailing}>
        {badge !== undefined && badge > 0 ? (
          <Badge label={String(badge)} tone="danger" />
        ) : value ? (
          <Text style={[styles.settingValue, { color: theme.textMuted }]}>{value}</Text>
        ) : null}
        <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
      </View>
    </Pressable>
  );
}

function DetailModal({
  visible,
  content,
  theme,
  onClose,
}: {
  visible: boolean;
  content: DetailModalContent | null;
  theme: ReturnType<typeof useTheme>["theme"];
  onClose: () => void;
}) {
  if (!content) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.detailIcon}>{content.icon}</Text>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{content.title}</Text>
          <Text style={[styles.detailBody, { color: theme.textSecondary }]}>{content.body}</Text>
          <Pressable
            style={[styles.detailCloseBtn, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.detailCloseText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  navWrap: { flex: 1, width: "100%" },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  navBtn: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    minHeight: touchTarget,
    justifyContent: "center",
  },
  navBackText: { fontSize: 14, fontWeight: "700" },
  navCenter: { flex: 1, alignItems: "center" },
  navTitle: { fontSize: 18, fontWeight: "800" },
  navSubtitle: { fontSize: 12, marginTop: 2 },
  navIconBtn: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navHomeIcon: { fontSize: 20 },
  navBtnPressed: { opacity: 0.85 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarColumn: { alignItems: "center", gap: spacing.sm },
  profilePhoto: {
    width: PROFILE_PHOTO_SIZE,
    height: PROFILE_PHOTO_SIZE,
    borderRadius: PROFILE_PHOTO_SIZE / 2,
    borderWidth: 2,
  },
  profilePhotoFallback: { alignItems: "center", justifyContent: "center" },
  profileInitials: { color: "#fff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
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
  section: { marginBottom: spacing.lg },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionIcon: { fontSize: 22, marginTop: 2 },
  sectionText: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: "800" },
  sectionDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: touchTarget + 8,
  },
  settingRowPressed: { opacity: 0.9 },
  settingIcon: { fontSize: 20, width: 28, textAlign: "center" },
  settingBody: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: "700" },
  settingDesc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  settingTrailing: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  settingValue: { fontSize: 12, fontWeight: "600", maxWidth: 88, textAlign: "right" },
  chevron: { fontSize: 20, fontWeight: "300" },
  roleSection: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  roleLabel: { fontSize: 15, fontWeight: "700" },
  roleSub: { fontSize: 12, marginTop: 4, marginBottom: spacing.md, lineHeight: 16 },
  roleRow: { flexDirection: "row", gap: spacing.md },
  roleBtn: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  roleBtnText: { fontSize: 14, fontWeight: "700" },
  footer: { textAlign: "center", fontSize: 12, marginTop: spacing.lg, marginBottom: spacing.md },
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
  modalTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: spacing.sm },
  modalMessage: { fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: spacing.xl },
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
  detailIcon: { fontSize: 36, textAlign: "center", marginBottom: spacing.sm },
  detailBody: { fontSize: 15, lineHeight: 22, textAlign: "center", marginBottom: spacing.xl },
  detailCloseBtn: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: touchTarget,
    justifyContent: "center",
  },
  detailCloseText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  editInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  modalBtn: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: touchTarget,
    justifyContent: "center",
  },
});
