import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { FlatmateDashboard, LandlordDashboard } from "../components/Dashboard";
import { NotificationBell } from "../components/NotificationBell";
import { ScreenShell } from "../components/ScreenShell";
import { UniversalSearch } from "../components/search/UniversalSearch";
import { UserAvatar } from "../components/UserAvatar";
import { BRAND_TAGLINE } from "../constants/branding";
import { spacing } from "../constants/design";
import { useTheme } from "../context/ThemeContext";
import { LocationModal } from "../src/components/location/LocationModal";
import { LocationSelector } from "../src/components/location/LocationSelector";
import { formatLocationLabel, useUserLocation } from "../src/hooks/useUserLocation";
import { AppNotification } from "../types/flat";
import { DemoRole, SubScreen, TabId } from "../types";
import { Property } from "../types/property";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface DashboardScreenProps {
  role: DemoRole;
  property: Property | null;
  properties: Property[];
  nextRentDate: string | null;
  nextRentAmount: number;
  rentDaysUntil: number | null;
  occupancyRate: number;
  unreadMessages: number;
  unreadNotifications: number;
  notifications: AppNotification[];
  monthlyIncome: number;
  collectedThisMonth: number;
  propertyCount: number;
  pendingRequests: number;
  outstandingRent: number;
  maintenanceCount: number;
  overdueCount: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  onMyFlat: () => void;
  onMessages: () => void;
  onMaintenance: () => void;
  onPayRent: () => void;
  onAskElla: () => void;
  onProperties: () => void;
  onTenants: () => void;
  onPayments: () => void;
  onProfile: () => void;
  onNotifications: () => void;
  onNavigateTab: (tab: TabId) => void;
  onNavigateSub: (screen: SubScreen) => void;
  userName?: string;
  avatarUrl?: string | null;
  avatarColor?: string;
}

export function DashboardScreen({
  role,
  property,
  properties,
  nextRentDate,
  nextRentAmount,
  rentDaysUntil,
  occupancyRate,
  unreadMessages,
  unreadNotifications,
  notifications,
  monthlyIncome,
  collectedThisMonth,
  propertyCount,
  pendingRequests,
  outstandingRent,
  maintenanceCount,
  overdueCount,
  refreshing,
  onRefresh,
  onMyFlat,
  onMessages,
  onMaintenance,
  onPayRent,
  onAskElla,
  onProperties,
  onTenants,
  onPayments,
  onProfile,
  onNotifications,
  onNavigateTab,
  onNavigateSub,
  userName = "there",
  avatarUrl,
  avatarColor = "#4F86F7",
}: DashboardScreenProps) {
  const { theme } = useTheme();
  const firstName = userName.split(" ")[0];
  const [locationOpen, setLocationOpen] = useState(false);
  const { location, saveLocation } = useUserLocation();
  const locationLabel = formatLocationLabel(location);

  const locationSummary = [...new Set(properties.map((p) => p.suburb))].slice(0, 4);

  return (
    <>
      <ScreenShell
        headerContent={
          <View style={styles.headerRow}>
            <BrandLogo variant="light" size="small" />
            <View style={styles.headerText}>
              <Text style={[styles.brand, { color: theme.text }]}>HomeHub NZ</Text>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                {getGreeting()}, {firstName} 👋
              </Text>
              <Text style={[styles.tagline, { color: theme.textMuted }]}>{BRAND_TAGLINE}</Text>
            </View>
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        headerRight={
          <View style={styles.headerRight}>
            <NotificationBell count={unreadNotifications} onPress={onNotifications} />
            <Pressable onPress={onProfile}>
              <UserAvatar name={userName} color={avatarColor} size={40} imageUri={avatarUrl} />
            </Pressable>
          </View>
        }
      >
        <LocationSelector locationLabel={locationLabel} onPress={() => setLocationOpen(true)} />

        <UniversalSearch
          role={role}
          onNavigateTab={onNavigateTab}
          onNavigateSub={onNavigateSub}
        />

        {role === "flatmate" ? (
          <FlatmateDashboard
            property={property}
            nextRentDate={nextRentDate}
            nextRentAmount={nextRentAmount}
            rentDaysUntil={rentDaysUntil}
            unreadMessages={unreadMessages}
            notifications={notifications}
            onMyFlat={onMyFlat}
            onMessages={onMessages}
            onMaintenance={onMaintenance}
            onPayRent={onPayRent}
            onAskElla={onAskElla}
          />
        ) : (
          <LandlordDashboard
            monthlyIncome={monthlyIncome}
            collectedThisMonth={collectedThisMonth}
            outstandingRent={outstandingRent}
            occupancyRate={occupancyRate}
            propertyCount={propertyCount}
            locationSummary={locationSummary}
            overdueCount={overdueCount}
            pendingJoinRequests={pendingRequests}
            maintenanceCount={maintenanceCount}
            notifications={notifications}
            onPayments={onPayments}
            onProperties={onProperties}
            onTenants={onTenants}
            onMessages={onMessages}
            onMaintenance={onMaintenance}
            unreadMessages={unreadMessages}
          />
        )}
      </ScreenShell>

      <LocationModal
        visible={locationOpen}
        onClose={() => setLocationOpen(false)}
        onSave={saveLocation}
        initialName={locationLabel}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  headerText: { flex: 1 },
  brand: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  greeting: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  tagline: { fontSize: 11, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
});
