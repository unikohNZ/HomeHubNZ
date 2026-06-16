import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandHeader } from "../components/BrandHeader";
import { BrandLogo } from "../components/BrandLogo";
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

interface DashboardScreenProps {
  role: DemoRole;
  rentDue: number;
  nextRentDate: string | null;
  nextRentAmount: number;
  rentDaysUntil: number | null;
  flatName: string | null;
  alertLevel: AlertLevel;
  alertTitle: string;
  occupancyRate: number;
  unreadMessages: number;
  choresPending: number;
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
  onEmergency: () => void;
  onCalendar: () => void;
  onAlerts: () => void;
  onNotifications: () => void;
  onProperties: () => void;
  onTenants: () => void;
  onPayments: () => void;
  onMaintenance: () => void;
  onProfile: () => void;
  landlordNotifications?: AppNotification[];
  nextInspectionDate?: string;
  inspectionReminder?: boolean;
  onScheduleInspection?: () => void;
}

export function DashboardScreen({
  role,
  rentDue,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  flatName,
  alertLevel,
  alertTitle,
  occupancyRate,
  unreadMessages,
  choresPending,
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
  onEmergency,
  onCalendar,
  onAlerts,
  onNotifications,
  onProperties,
  onTenants,
  onPayments,
  onMaintenance,
  onProfile,
  landlordNotifications = notifications,
  nextInspectionDate = "20 June 2026",
  inspectionReminder = true,
  onScheduleInspection,
}: DashboardScreenProps) {
  const { theme } = useTheme();
  const user = role === "landlord" ? LANDLORD_USER : FLATMATE_USER;
  const firstName = user.name.split(" ")[0];

  return (
    <ScreenShell
      headerContent={
        role === "flatmate" ? (
          <BrandHeader
            variant="icon"
            subtitle={`${getGreeting()}, ${firstName} 👋`}
            badgeCount={unreadNotifications}
          />
        ) : (
          <View style={styles.landlordHeader}>
            <BrandLogo variant="light" size="medium" />
            <View style={styles.landlordText}>
              <Text style={[styles.landlordTitle, { color: theme.text }]}>HomeHub NZ</Text>
              <Text style={[styles.landlordSub, { color: theme.textSecondary }]}>
                Landlord property portal
              </Text>
            </View>
          </View>
        )
      }
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
        </View>
      }
    >
      {role === "flatmate" ? (
        <FlatmateDashboard
          rentDue={rentDue}
          nextRentDate={nextRentDate}
          nextRentAmount={nextRentAmount}
          rentDaysUntil={rentDaysUntil}
          flatName={flatName}
          alertLevel={alertLevel}
          alertTitle={alertTitle}
          unreadMessages={unreadMessages}
          choresPending={choresPending}
          notifications={notifications}
          onMyFlat={onMyFlat}
          onRent={onRent}
          onMessages={onMessages}
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
