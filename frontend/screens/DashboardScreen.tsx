import { Pressable, StyleSheet, Text, View } from "react-native";
import { FlatmateDashboard, LandlordDashboard } from "../components/Dashboard";
import { NotificationBell } from "../components/NotificationBell";
import { ScreenShell } from "../components/ScreenShell";
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../context/ThemeContext";
import { FLATMATE_USER, LANDLORD_USER } from "../data/mockUsers";
import { AppNotification } from "../types/flat";
import { DemoRole } from "../types";
import { AlertLevel } from "../components/ui/AlertStatusBanner";
import { spacing } from "../constants/design";

interface DashboardScreenProps {
  role: DemoRole;
  rentDue: number;
  nextRentDate: string | null;
  nextRentAmount: number;
  flatName: string | null;
  alertLevel: AlertLevel;
  alertTitle: string;
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
  onRent: () => void;
  onMessages: () => void;
  onRules: () => void;
  onEmergency: () => void;
  onCalendar: () => void;
  onAlerts: () => void;
  onNotifications: () => void;
  onProperties: () => void;
  onTenants: () => void;
  onPayments: () => void;
  onMaintenance: () => void;
  onProfile: () => void;
}

export function DashboardScreen({
  role,
  rentDue,
  nextRentDate,
  nextRentAmount,
  flatName,
  alertLevel,
  alertTitle,
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
  onRent,
  onMessages,
  onRules,
  onEmergency,
  onCalendar,
  onAlerts,
  onNotifications,
  onProperties,
  onTenants,
  onPayments,
  onMaintenance,
  onProfile,
}: DashboardScreenProps) {
  const { theme } = useTheme();
  const user = role === "landlord" ? LANDLORD_USER : FLATMATE_USER;

  return (
    <ScreenShell
      title="HomeHub NZ"
      subtitle={role === "flatmate" ? "Kia ora — your household hub" : "Landlord property portal"}
      refreshing={refreshing}
      onRefresh={onRefresh}
      headerRight={
        <View style={styles.headerRight}>
          <Pressable onPress={onProfile}>
            <UserAvatar name={user.name} color={user.avatar_color} size={40} />
          </Pressable>
          {role === "flatmate" && (
            <NotificationBell count={unreadNotifications} onPress={onNotifications} />
          )}
          <View style={[styles.nzBadge, { backgroundColor: theme.accentMuted }]}>
            <Text style={[styles.nzText, { color: theme.accent }]}>NZ</Text>
          </View>
        </View>
      }
    >
      {role === "flatmate" ? (
        <FlatmateDashboard
          rentDue={rentDue}
          nextRentDate={nextRentDate}
          nextRentAmount={nextRentAmount}
          flatName={flatName}
          alertLevel={alertLevel}
          alertTitle={alertTitle}
          notifications={notifications}
          onMyFlat={onMyFlat}
          onRent={onRent}
          onMessages={onMessages}
          onRules={onRules}
          onEmergency={onEmergency}
          onCalendar={onCalendar}
          onAlerts={onAlerts}
          onNotifications={onNotifications}
        />
      ) : (
        <LandlordDashboard
          monthlyIncome={monthlyIncome}
          propertyCount={propertyCount}
          occupancyRate={occupancyRate}
          outstandingRent={outstandingRent}
          maintenanceCount={maintenanceCount}
          pendingRequests={pendingRequests}
          onProperties={onProperties}
          onTenants={onTenants}
          onPayments={onPayments}
          onMaintenance={onMaintenance}
          onProfile={onProfile}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  nzBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  nzText: { fontSize: 12, fontWeight: "800" },
});
