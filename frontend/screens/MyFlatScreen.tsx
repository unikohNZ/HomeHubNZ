import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { OfflineBanner } from "../components/OfflineBanner";
import { ScreenShell } from "../components/ScreenShell";
import { UserAvatar } from "../components/UserAvatar";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SegmentTabs } from "../components/ui/SegmentTabs";
import { useTheme } from "../context/ThemeContext";
import { MOCK_FLATMATE_MEMBERS, MOCK_HOUSE_RULES, MOCK_SHARED_BILLS } from "../data/mockFlatData";
import { JoinRequest } from "../types/request";
import { HouseRule } from "../types/flat";
import { Property } from "../types/property";
import { SubScreen } from "../types/navigation";
import { FeatureTabId } from "../data/featureCategories";
import { formatCurrency } from "../utils/format";
import { radius, spacing } from "../constants/design";

type FlatTab = "overview" | "flatmates" | "rules" | "bills" | "gallery" | "documents";

const FLAT_TABS: { id: FlatTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "flatmates", label: "Flatmates" },
  { id: "bills", label: "Bills" },
  { id: "rules", label: "Rules" },
  { id: "gallery", label: "Gallery" },
  { id: "documents", label: "Documents" },
];

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
  propertiesLoading?: boolean;
  propertiesError?: string | null;
  propertiesOffline?: boolean;
  houseRules?: HouseRule[];
  onRetryProperties?: () => void;
  onOpenPropertySearch?: () => void;
  onRequestJoin: (propertyId: string) => void;
  onCancelRequest: (id: string) => void;
  onLeaveFlat: () => void;
  onNavigateFeature: (screen: SubScreen) => void;
  onNavigateTab?: (tab: FeatureTabId) => void;
  onMessageFlatmates: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

function rentShare(property: Property) {
  return Math.round(property.weekly_rent / property.max_flatmates);
}

function bondShare(property: Property) {
  return Math.round(property.bond / property.max_flatmates);
}

export function MyFlatScreen(props: MyFlatScreenProps) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<FlatTab>("overview");
  const {
    searchQuery, onSearchChange, searchResults, allProperties, joinedProperty,
    myJoinRequests, nextRentDate, maintenanceActive, propertiesLoading, propertiesError,
    propertiesOffline = false, houseRules = MOCK_HOUSE_RULES, onRetryProperties, onOpenPropertySearch,
    onLeaveFlat, onNavigateFeature, onNavigateTab, onMessageFlatmates, refreshing, onRefresh,
  } = props;

  if (!joinedProperty) {
    return <BrowseFlats {...props} />;
  }

  const occupancy = `${joinedProperty.flatmate_count}/${joinedProperty.max_flatmates}`;

  return (
    <ScreenShell
      title="My Flat"
      subtitle={joinedProperty.name}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <OfflineBanner
        loading={propertiesLoading}
        isOffline={propertiesOffline}
        onRetry={onRetryProperties}
      />

      <SegmentTabs tabs={FLAT_TABS} active={tab} onChange={setTab} />

      {tab === "overview" && (
        <>
          <Image source={{ uri: joinedProperty.image_url }} style={styles.hero} />
          <Text style={[styles.address, { color: theme.textSecondary }]}>
            {joinedProperty.address}, {joinedProperty.suburb}, {joinedProperty.city}
          </Text>
          <View style={styles.statsGrid}>
            <Stat label="Weekly Rent" value={formatCurrency(rentShare(joinedProperty))} />
            <Stat label="Bond Share" value={formatCurrency(bondShare(joinedProperty))} />
            <Stat label="Lease Start" value={joinedProperty.lease_start ?? "—"} />
            <Stat label="Lease End" value={joinedProperty.lease_end ?? "—"} />
            <Stat label="Occupancy" value={occupancy} />
            <Stat label="Next Rent" value={nextRentDate ?? "—"} />
          </View>
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={onMessageFlatmates}>
              <Text style={styles.actionBtnText}>💬 Message Flatmates</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}
              onPress={() => onNavigateFeature("documents")}
            >
              <Text style={[styles.actionBtnTextDark, { color: theme.text }]}>📄 Upload Document</Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.reportBtn, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}
            onPress={() => onNavigateFeature("maintenance")}
          >
            <Text style={[styles.reportText, { color: theme.warning }]}>🔧 Report Issue</Text>
          </Pressable>
          <Pressable style={[styles.leaveBtn, { borderColor: theme.danger, marginTop: 8 }]} onPress={onLeaveFlat}>
            <Text style={[styles.leaveText, { color: theme.danger }]}>Leave Flat</Text>
          </Pressable>
        </>
      )}

      {tab === "flatmates" && (
        <>
          {MOCK_FLATMATE_MEMBERS.map((fm) => (
            <View key={fm.id} style={[styles.fmCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <UserAvatar name={fm.name} color={fm.avatar_color} size={52} />
              <View style={styles.flex}>
                <Text style={[styles.fmName, { color: theme.text }]}>{fm.name}</Text>
                <Text style={[styles.fmRoom, { color: theme.textMuted }]}>
                  {fm.chore_assignment} · {fm.role}
                </Text>
                <Text style={[styles.fmContact, { color: theme.primary }]}>
                  {fm.online ? "Online now" : "Offline"}
                </Text>
              </View>
              <Badge label={fm.rent_status} tone={fm.rent_status === "paid" ? "success" : "warning"} />
            </View>
          ))}
        </>
      )}

      {tab === "rules" && (
        <>
          {houseRules.map((rule) => (
            <View key={rule.id} style={[styles.ruleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.ruleText, { color: theme.text }]}>{rule.text}</Text>
              <Badge label={rule.accepted ? "Accepted" : "Review"} tone={rule.accepted ? "success" : "warning"} />
            </View>
          ))}
          <Pressable style={[styles.linkBtn, { backgroundColor: theme.primaryMuted }]} onPress={() => onNavigateFeature("house-rules")}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Manage all rules →</Text>
          </Pressable>
        </>
      )}

      {tab === "bills" && (
        <>
          {["Power", "Internet", "Water", "Gas"].map((type) => {
            const bill = MOCK_SHARED_BILLS.find((b) => b.type === type.toLowerCase() || b.label.toLowerCase().includes(type.toLowerCase()));
            return (
              <View key={type} style={[styles.billCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.billType, { color: theme.text }]}>{type}</Text>
                <Text style={[styles.billAmt, { color: theme.primary }]}>
                  {bill ? formatCurrency(bill.split_amount) : "—"}
                </Text>
                <Badge
                  label={bill?.status === "paid" ? "Paid" : "Pending"}
                  tone={bill?.status === "paid" ? "success" : "warning"}
                />
              </View>
            );
          })}
          <Pressable style={[styles.linkBtn, { backgroundColor: theme.primaryMuted }]} onPress={() => onNavigateFeature("bills")}>
            <Text style={[styles.linkText, { color: theme.primary }]}>View all bills →</Text>
          </Pressable>
        </>
      )}

      {tab === "gallery" && (
        <>
          <EmptyState
            icon="🖼️"
            title="Property gallery"
            subtitle="Photos of your flat and shared spaces."
            actionLabel="Open gallery"
            onAction={() => onNavigateFeature("gallery")}
          />
        </>
      )}

      {tab === "documents" && (
        <>
          <EmptyState
            icon="📄"
            title="Flat documents"
            subtitle="Leases, receipts, and shared files."
            actionLabel="View documents"
            onAction={() => onNavigateFeature("documents")}
          />
          <Pressable
            style={[styles.linkBtn, { backgroundColor: theme.primaryMuted }]}
            onPress={() => onNavigateFeature("documents")}
          >
            <Text style={[styles.linkText, { color: theme.primary }]}>Upload document →</Text>
          </Pressable>
        </>
      )}
    </ScreenShell>
  );
}

function BrowseFlats(props: MyFlatScreenProps) {
  const { theme } = useTheme();
  const {
    searchQuery, onSearchChange, searchResults, allProperties, joinedProperty,
    myJoinRequests, propertiesLoading, propertiesOffline = false,
    onRetryProperties, onOpenPropertySearch, onRequestJoin, onCancelRequest,
  } = props;

  const availableToJoin = searchResults.filter((p) => p.id !== joinedProperty?.id);
  const getRequestForProperty = (propertyId: string) =>
    myJoinRequests.find((r) => r.property_id === propertyId);

  return (
    <ScreenShell title="My Flat" subtitle="Find your next flat in NZ">
      <OfflineBanner
        loading={propertiesLoading}
        isOffline={propertiesOffline}
        onRetry={onRetryProperties}
      />
      <TextInput
        style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
        placeholder="Search by flat name or address"
        placeholderTextColor={theme.textMuted}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {onOpenPropertySearch && (
        <Pressable
          style={[styles.searchBtn, { backgroundColor: theme.primaryMuted }]}
          onPress={onOpenPropertySearch}
        >
          <Text style={[styles.searchBtnText, { color: theme.primary }]}>
            Advanced search with filters →
          </Text>
        </Pressable>
      )}
      {myJoinRequests.length > 0 && (
        <>
          <SectionHeader title="Join Request Status" />
          {myJoinRequests.map((req) => {
            const prop = allProperties.find((p) => p.id === req.property_id);
            return (
              <JoinRequestCard
                key={req.id}
                request={req}
                propertyName={prop?.name ?? "Property"}
                onCancel={req.status === "pending" ? () => onCancelRequest(req.id) : undefined}
              />
            );
          })}
        </>
      )}
      <SectionHeader title={`Available Flats (${availableToJoin.length})`} />
      {availableToJoin.map((property) => {
        const req = getRequestForProperty(property.id);
        const hasRequest = req && req.status !== "rejected";
        return (
          <View key={property.id} style={[styles.searchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image source={{ uri: property.image_url }} style={styles.searchImage} />
            <Text style={[styles.flatName, { color: theme.text }]}>{property.name}</Text>
            <Text style={[styles.address, { color: theme.textMuted }]}>
              {property.address}, {property.suburb}
            </Text>
            <Text style={[styles.rentLine, { color: theme.primary }]}>
              {formatCurrency(property.weekly_rent)}/wk
            </Text>
            {!hasRequest && (
              <Pressable style={[styles.joinBtn, { backgroundColor: theme.primary }]} onPress={() => onRequestJoin(property.id)}>
                <Text style={styles.joinBtnText}>Request to Join</Text>
              </Pressable>
            )}
            {req?.status === "pending" && (
              <Badge label="Request pending" tone="warning" />
            )}
          </View>
        );
      })}
    </ScreenShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", height: 180, borderRadius: radius.xl, marginBottom: spacing.md },
  address: { fontSize: 14, marginBottom: spacing.lg },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  stat: { width: "47%", flexGrow: 1, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  statValue: { fontSize: 15, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  actionBtn: { flex: 1, borderRadius: radius.lg, paddingVertical: 14, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  actionBtnTextDark: { fontWeight: "700", fontSize: 14 },
  reportBtn: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  reportText: { fontWeight: "700", fontSize: 14 },
  leaveBtn: { borderRadius: radius.lg, borderWidth: 1, paddingVertical: 14, paddingHorizontal: spacing.lg, justifyContent: "center" },
  leaveText: { fontWeight: "700", fontSize: 14 },
  flex: { flex: 1 },
  fmCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  fmName: { fontSize: 16, fontWeight: "800" },
  fmRoom: { fontSize: 13, marginTop: 2 },
  fmContact: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  ruleCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm },
  ruleText: { fontSize: 15, lineHeight: 22 },
  billCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  billType: { fontSize: 15, fontWeight: "700", flex: 1 },
  billAmt: { fontSize: 16, fontWeight: "800" },
  maintCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  maintTitle: { fontSize: 15, fontWeight: "700" },
  maintMeta: { fontSize: 12, marginTop: 4 },
  linkBtn: { borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", marginTop: spacing.sm },
  linkText: { fontWeight: "700", fontSize: 14 },
  search: { borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: 15, marginBottom: spacing.sm },
  searchBtn: { borderRadius: radius.lg, padding: spacing.md, alignItems: "center", marginBottom: spacing.lg },
  searchBtnText: { fontWeight: "700", fontSize: 14 },
  searchCard: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  searchImage: { width: "100%", height: 120, borderRadius: radius.lg, marginBottom: spacing.md },
  flatName: { fontSize: 20, fontWeight: "800" },
  rentLine: { fontSize: 14, fontWeight: "700", marginTop: spacing.sm, marginBottom: spacing.md },
  joinBtn: { borderRadius: radius.lg, paddingVertical: 14, alignItems: "center" },
  joinBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
