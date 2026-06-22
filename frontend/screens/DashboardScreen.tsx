import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { FlatmateDashboard, LandlordDashboard } from "../components/Dashboard";
import { NotificationBell } from "../components/NotificationBell";
import { ScreenShell } from "../components/ScreenShell";
import { UserAvatar } from "../components/UserAvatar";
import { spacing } from "../constants/design";
import { useTheme } from "../context/ThemeContext";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { AppNotification } from "../types/flat";
import { DemoRole } from "../types";
import { Property } from "../types/property";

interface DashboardScreenProps {
  role: DemoRole;
  property: Property | null;
  nextRentDate: string | null;
  nextRentAmount: number;
  rentDaysUntil: number | null;
  occupancyRate: number;
  unreadMessages: number;
  unreadNotifications: number;
  notifications: AppNotification[];
  monthlyIncome: number;
  propertyCount: number;
  pendingRequests: number;
  outstandingRent: number;
  maintenanceCount: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onMyFlat: () => void;
  onMessages: () => void;
  onMaintenance: () => void;
  onCalendar: () => void;
  onPayRent: () => void;
  onViewHistory: () => void;
  onProperties: () => void;
  onTenants: () => void;
  onPayments: () => void;
  onProfile: () => void;
  onNotifications: () => void;
  userName?: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  landlordNotifications?: AppNotification[];
  nextInspectionDate?: string;
  inspectionReminder?: boolean;
  onScheduleInspection?: () => void;
}

export function DashboardScreen({
  role,
  property,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  occupancyRate,
  unreadMessages,
  unreadNotifications,
  notifications,
  monthlyIncome,
  propertyCount,
  pendingRequests,
  outstandingRent,
  maintenanceCount,
  refreshing,
  onRefresh,
  onMyFlat,
  onMessages,
  onMaintenance,
  onCalendar,
  onPayRent,
  onViewHistory,
  onProperties,
  onTenants,
  onPayments,
  onProfile,
  onNotifications,
  userName,
  avatarUrl,
  avatarColor,
  landlordNotifications = notifications,
  nextInspectionDate = "20 June 2026",
  inspectionReminder = true,
  onScheduleInspection,
}: DashboardScreenProps) {
  const { theme } = useTheme();
  const fallbackUser = role === "landlord" ? LANDLORD_USER : FLATMATE_USER;
  const user = {
    ...fallbackUser,
    name: userName ?? fallbackUser.name,
    avatar_url: avatarUrl,
    avatar_color: avatarColor ?? fallbackUser.avatar_color,
  };

  return (
    <ScreenShell
      headerContent={
        role === "landlord" ? (
          <View style={styles.landlordHeader}>
            <BrandLogo variant="light" size="medium" />
            <View style={styles.landlordText}>
              <Text style={[styles.landlordTitle, { color: theme.text }]}>HomeHub NZ</Text>
              <Text style={[styles.landlordSub, { color: theme.textSecondary }]}>
                Landlord portal
              </Text>
            </View>
          </View>
        ) : undefined
      }
      title={role === "flatmate" ? "Home" : undefined}
      subtitle={role === "flatmate" ? "Your flat at a glance" : undefined}
      refreshing={refreshing}
      onRefresh={onRefresh}
      headerRight={
        <View style={styles.headerRight}>
          <Pressable onPress={onProfile}>
            <UserAvatar
              name={user.name}
              color={user.avatar_color}
              size={40}
              imageUri={user.avatar_url}
            />
          </Pressable>
          <NotificationBell count={unreadNotifications} onPress={onNotifications} />
        </View>
      }
    >
      {role === "flatmate" ? (
        <FlatmateDashboard
          userName={user.name}
          avatarUrl={user.avatar_url}
          avatarColor={user.avatar_color}
          property={property}
          nextRentDate={nextRentDate}
          nextRentAmount={nextRentAmount}
          rentDaysUntil={rentDaysUntil}
          unreadMessages={unreadMessages}
          notifications={notifications}
          onMyFlat={onMyFlat}
          onMessages={onMessages}
          onMaintenance={onMaintenance}
          onCalendar={onCalendar}
          onPayRent={onPayRent}
          onViewHistory={onViewHistory}
        />
      ) : (
        <LandlordDashboard
          monthlyIncome={monthlyIncome}
          propertyCount={propertyCount}
          occupancyRate={occupancyRate}
          outstandingRent={outstandingRent}
          maintenanceCount={maintenanceCount}
          pendingRequests={pendingRequests}
          notifications={landlordNotifications}
          nextInspectionDate={nextInspectionDate}
          inspectionReminder={inspectionReminder}
          onProperties={onProperties}
          onTenants={onTenants}
          onPayments={onPayments}
          onMaintenance={onMaintenance}
          onProfile={onProfile}
          onNotifications={onNotifications}
          onScheduleInspection={onScheduleInspection ?? onCalendar}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  landlordHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  landlordText: { flex: 1 },
  landlordTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  landlordSub: { fontSize: 14, marginTop: 2, fontWeight: "500" },
});
