import { StyleSheet, Text, View } from "react-native";
import { FlatmateDashboard, LandlordDashboard } from "../components/Dashboard";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { DemoRole } from "../types";

interface DashboardScreenProps {
  role: DemoRole;
  rentDue: number;
  nextRentDate: string | null;
  flatName: string | null;
  maintenanceCount: number;
  unreadMessages: number;
  upcomingBills: number;
  monthlyIncome: number;
  propertyCount: number;
  pendingRequests: number;
  outstandingRent: number;
  onMyFlat: () => void;
  onRent: () => void;
  onMessages: () => void;
  onProperties: () => void;
  onRequests: () => void;
}

export function DashboardScreen({
  role,
  rentDue,
  nextRentDate,
  flatName,
  maintenanceCount,
  unreadMessages,
  upcomingBills,
  monthlyIncome,
  propertyCount,
  pendingRequests,
  outstandingRent,
  onMyFlat,
  onRent,
  onMessages,
  onProperties,
  onRequests,
}: DashboardScreenProps) {
  const { theme } = useTheme();

  return (
    <ScreenShell
      title="HomeHub NZ"
      subtitle={
        role === "flatmate"
          ? "Your flat, rent & messages"
          : "Property management dashboard"
      }
      headerRight={
        <View style={[styles.badge, { backgroundColor: theme.primaryMuted }]}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>NZ</Text>
        </View>
      }
    >
      {role === "flatmate" ? (
        <FlatmateDashboard
          rentDue={rentDue}
          nextRentDate={nextRentDate}
          flatName={flatName}
          maintenanceCount={maintenanceCount}
          unreadMessages={unreadMessages}
          upcomingBills={upcomingBills}
          onMyFlat={onMyFlat}
          onRent={onRent}
          onMessages={onMessages}
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
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: "800" },
});
