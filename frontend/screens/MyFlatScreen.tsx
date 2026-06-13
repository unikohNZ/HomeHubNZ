import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { DashboardQuickGrid } from "../components/DashboardQuickCard";
import { FeatureMenu } from "../components/FeatureMenu";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { DASHBOARD_QUICK_CARDS } from "../data/mockFlatExtended";
import { JoinRequest } from "../types/request";
import { Property } from "../types/property";
import { SubScreen } from "../types/navigation";
import { formatCurrency } from "../utils/format";

interface MyFlatScreenProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: Property[];
  allProperties: Property[];
  joinedProperty: Property | null;
  myJoinRequests: JoinRequest[];
  nextRentDate: string | null;
  nextRentAmount: number;
  billsDueCount: number;
  choresPending: number;
  maintenanceActive: number;
  documentCount: number;
  unreadAnnouncements: number;
  shoppingPending: number;
  upcomingVisitors: number;
  onRequestJoin: (propertyId: string) => void;
  onCancelRequest: (id: string) => void;
  onLeaveFlat: () => void;
  onNavigateFeature: (screen: SubScreen) => void;
  onMessageFlatmates: () => void;
}

function rentShare(property: Property) {
  return Math.round(property.weekly_rent / property.max_flatmates);
}

function bondShare(property: Property) {
  return Math.round(property.bond / property.max_flatmates);
}

export function MyFlatScreen({
  searchQuery,
  onSearchChange,
  searchResults,
  allProperties,
  joinedProperty,
  myJoinRequests,
  nextRentDate,
  nextRentAmount,
  billsDueCount,
  choresPending,
  maintenanceActive,
  documentCount,
  unreadAnnouncements,
  shoppingPending,
  upcomingVisitors,
  onRequestJoin,
  onCancelRequest,
  onLeaveFlat,
  onNavigateFeature,
  onMessageFlatmates,
}: MyFlatScreenProps) {
  const { theme } = useTheme();

  const availableToJoin = searchResults.filter((p) => p.id !== joinedProperty?.id);
  const getRequestForProperty = (propertyId: string) =>
    myJoinRequests.find((r) => r.property_id === propertyId);

  if (!joinedProperty) {
    return (
      <ScreenShell title="My Flat" subtitle="Search and join a flat">
        <TextInput
          style={[
            styles.search,
            { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
          ]}
          placeholder="Search by flat name or address"
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />

        {myJoinRequests.length > 0 && (
          <>
            <Text style={[styles.section, { color: theme.text }]}>Join Request Status</Text>
            {myJoinRequests.map((req) => {
              const prop = allProperties.find((p) => p.id === req.property_id);
              return (
                <JoinRequestCard
                  key={req.id}
                  request={req}
                  propertyName={prop?.name ?? "Property"}
                  onCancel={
                    req.status === "pending" ? () => onCancelRequest(req.id) : undefined
                  }
                />
              );
            })}
          </>
        )}

        <Text style={[styles.section, { color: theme.text }]}>
          Available Flats ({availableToJoin.length})
        </Text>
        {availableToJoin.map((property) => {
          const req = getRequestForProperty(property.id);
          const hasRequest = req && req.status !== "rejected";
          return (
            <View
              key={property.id}
              style={[styles.searchCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Image source={{ uri: property.image_url }} style={styles.searchImage} />
              <Text style={[styles.flatName, { color: theme.text }]}>{property.name}</Text>
              <Text style={[styles.address, { color: theme.textMuted }]}>
                {property.address}, {property.suburb}
              </Text>
              <Text style={[styles.rentLine, { color: theme.primary }]}>
                {formatCurrency(property.weekly_rent)}/wk
              </Text>
              {!hasRequest && (
                <Pressable
                  style={[styles.joinBtn, { backgroundColor: theme.primary }]}
                  onPress={() => onRequestJoin(property.id)}
                >
                  <Text style={styles.joinBtnText}>Request to Join</Text>
                </Pressable>
              )}
              {req?.status === "pending" && (
                <View style={[styles.statusNote, { backgroundColor: theme.warningMuted }]}>
                  <Text style={[styles.statusText, { color: theme.warning }]}>Request pending</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScreenShell>
    );
  }

  const occupancy = `${joinedProperty.flatmate_count}/${joinedProperty.max_flatmates}`;

  return (
    <ScreenShell title="My Flat" subtitle={joinedProperty.name}>
      <View style={[styles.dashboard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Image source={{ uri: joinedProperty.image_url }} style={styles.image} />
        <Text style={[styles.flatName, { color: theme.text }]}>{joinedProperty.name}</Text>
        <Text style={[styles.address, { color: theme.textMuted }]}>
          {joinedProperty.address}, {joinedProperty.suburb}, {joinedProperty.city}
        </Text>

        <View style={styles.statsGrid}>
          <Stat label="My rent share" value={formatCurrency(rentShare(joinedProperty))} />
          <Stat label="Total rent" value={`${formatCurrency(joinedProperty.weekly_rent)}/wk`} />
          <Stat label="Bond share" value={formatCurrency(bondShare(joinedProperty))} />
          <Stat label="Next rent due" value={nextRentDate ?? "—"} />
          <Stat label="Lease start" value={joinedProperty.lease_start ?? "—"} />
          <Stat label="Lease end" value={joinedProperty.lease_end ?? "—"} />
          <Stat label="Flatmates" value={occupancy} />
          <Stat label="Occupancy" value={joinedProperty.flatmate_count >= joinedProperty.max_flatmates ? "Full" : "Space"} />
          <Stat label="Maintenance" value={String(maintenanceActive)} sub="Active" />
          <Stat label="Bills due" value={String(billsDueCount)} sub="Pending" />
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.primaryMuted }]}
            onPress={() => onNavigateFeature("house-rules")}
          >
            <Text style={[styles.actionText, { color: theme.primary }]}>📋 Rules</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.primaryMuted }]}
            onPress={onMessageFlatmates}
          >
            <Text style={[styles.actionText, { color: theme.primary }]}>💬 Message</Text>
          </Pressable>
          <Pressable style={styles.leaveBtn} onPress={onLeaveFlat}>
            <Text style={[styles.leaveText, { color: theme.danger }]}>Leave Flat</Text>
          </Pressable>
        </View>
      </View>

      {nextRentAmount > 0 && (
        <Pressable
          style={[styles.alert, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}
          onPress={() => onNavigateFeature("bills")}
        >
          <Text style={[styles.alertTitle, { color: theme.warning }]}>
            {formatCurrency(nextRentAmount)} rent due
            {nextRentDate ? ` · ${nextRentDate}` : ""}
          </Text>
        </Pressable>
      )}

      {choresPending > 0 && (
        <Pressable
          style={[styles.alert, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}
          onPress={() => onNavigateFeature("chores")}
        >
          <Text style={[styles.alertTitle, { color: theme.primary }]}>
            {choresPending} chore{choresPending > 1 ? "s" : ""} pending for you
          </Text>
        </Pressable>
      )}

      <Text style={[styles.section, { color: theme.text }]}>Quick Access</Text>
      <DashboardQuickGrid
        items={DASHBOARD_QUICK_CARDS.map((card) => ({
          id: card.id,
          label: card.label,
          icon: card.icon,
          badge:
            card.countKey === "documents"
              ? documentCount
              : card.countKey === "announcements"
                ? unreadAnnouncements
                : card.countKey === "shopping"
                  ? shoppingPending
                  : card.countKey === "visitors"
                    ? upcomingVisitors
                    : undefined,
        }))}
        onNavigate={onNavigateFeature}
      />

      <Text style={[styles.section, { color: theme.text }]}>Flat Features</Text>
      <FeatureMenu onNavigate={onNavigateFeature} />
    </ScreenShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      {sub && <Text style={[styles.statSub, { color: theme.textMuted }]}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  section: { fontSize: 17, fontWeight: "800", marginBottom: 12, marginTop: 8 },
  searchCard: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 14 },
  searchImage: { width: "100%", height: 120, borderRadius: 16, marginBottom: 12 },
  flatName: { fontSize: 20, fontWeight: "800" },
  address: { fontSize: 14, marginTop: 4 },
  rentLine: { fontSize: 14, fontWeight: "700", marginTop: 8, marginBottom: 12 },
  joinBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  joinBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  statusNote: { borderRadius: 12, padding: 12, alignItems: "center" },
  statusText: { fontSize: 14, fontWeight: "700" },
  dashboard: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 14 },
  image: { width: "100%", height: 140, borderRadius: 16, marginBottom: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  stat: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  statValue: { fontSize: 15, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  statSub: { fontSize: 10 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  actionText: { fontSize: 13, fontWeight: "700" },
  leaveBtn: { paddingVertical: 10, paddingHorizontal: 8 },
  leaveText: { fontSize: 14, fontWeight: "700" },
  alert: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  alertTitle: { fontSize: 14, fontWeight: "700" },
});
