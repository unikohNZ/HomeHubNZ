import { StyleSheet, Text, View } from "react-native";
import { FlatmateDashboard, LandlordDashboard } from "../components/Dashboard";
import { NotificationBell } from "../components/NotificationBell";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { DemoRole } from "../types";

interface DashboardScreenProps {
  role: DemoRole;
  rentDue: number;
  nextRentDate: string | null;
  nextRentAmount: number;
  flatName: string | null;
  maintenanceCount: number;
  unreadMessages: number;
  unreadNotifications: number;
  billsDueCount: number;
  choresPending: number;
  monthlyIncome: number;
  propertyCount: number;
  pendingRequests: number;
  outstandingRent: number;
  onMyFlat: () => void;
  onRent: () => void;
  onMessages: () => void;
  onNotifications: () => void;
  onChores: () => void;
  onBills: () => void;
  onCalendar: () => void;
  onAI: () => void;
  onProperties: () => void;
  onRequests: () => void;
}

export function DashboardScreen({
  role,
  rentDue,
  nextRentDate,
  nextRentAmount,
  flatName,
  maintenanceCount,
  unreadMessages,
  unreadNotifications,
  billsDueCount,
  choresPending,
  monthlyIncome,
  propertyCount,
  pendingRequests,
  outstandingRent,
  onMyFlat,
  onRent,
  onMessages,
  onNotifications,
  onChores,
  onBills,
  onCalendar,
  onAI,
  onProperties,
  onRequests,
}: DashboardScreenProps) {
  const { theme } = useTheme();

  return (
    <ScreenShell
      title="HomeHub NZ"
      subtitle={role === "flatmate" ? "Your flat, rent & household hub" : "Property management dashboard"}
      headerRight={
        <View style={styles.headerRight}>
          {role === "flatmate" && (
            <NotificationBell count={unreadNotifications} onPress={onNotifications} />
          )}
          <View style={[styles.nzBadge, { backgroundColor: theme.primaryMuted }]}>
            <Text style={[styles.nzText, { color: theme.primary }]}>NZ</Text>
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
          maintenanceCount={maintenanceCount}
          unreadMessages={unreadMessages}
          unreadNotifications={unreadNotifications}
          billsDueCount={billsDueCount}
          choresPending={choresPending}
          onMyFlat={onMyFlat}
          onRent={onRent}
          onMessages={onMessages}
          onNotifications={onNotifications}
          onChores={onChores}
          onBills={onBills}
          onCalendar={onCalendar}
          onAI={onAI}
        />
      ) : (
        <LandlordDashboard
          monthlyIncome={monthlyIncome}
          propertyCount={propertyCount}
          pendingRequests={pendingRequests}
          outstandingRent={outstandingRent}
          maintenanceCount={maintenanceCount}
          onProperties={onProperties}
          onRequests={onRequests}
          onRent={onRent}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  nzBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  nzText: { fontSize: 12, fontWeight: "800" },
});
