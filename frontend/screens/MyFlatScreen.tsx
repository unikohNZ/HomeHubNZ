import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { ScreenShell } from "../components/ScreenShell";
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../context/ThemeContext";
import { MOCK_FLATMATES } from "../data/mockUsers";
import { JoinRequest } from "../types/request";
import { Property } from "../types/property";
import { formatCurrency } from "../utils/format";

interface MyFlatScreenProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchResults: Property[];
  allProperties: Property[];
  joinedProperty: Property | null;
  myJoinRequests: JoinRequest[];
  onRequestJoin: (propertyId: string) => void;
  onCancelRequest: (id: string) => void;
  onLeaveFlat: () => void;
}

function rentShare(property: Property) {
  return Math.round(property.weekly_rent / property.max_flatmates);
}

export function MyFlatScreen({
  searchQuery,
  onSearchChange,
  searchResults,
  allProperties,
  joinedProperty,
  myJoinRequests,
  onRequestJoin,
  onCancelRequest,
  onLeaveFlat,
}: MyFlatScreenProps) {
  const { theme } = useTheme();

  const availableToJoin = searchResults.filter(
    (p) => p.id !== joinedProperty?.id,
  );

  const getRequestForProperty = (propertyId: string) =>
    myJoinRequests.find((r) => r.property_id === propertyId);

  return (
    <ScreenShell title="My Flat" subtitle="Your flat, search & join requests">
      <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Current Flat</Text>

      {joinedProperty ? (
        <View style={[styles.currentFlat, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Image source={{ uri: joinedProperty.image_url }} style={styles.image} />
          <Text style={[styles.flatName, { color: theme.text }]}>{joinedProperty.name}</Text>
          <Text style={[styles.address, { color: theme.textMuted }]}>
            {joinedProperty.address}, {joinedProperty.suburb}, {joinedProperty.city}
          </Text>

          <View style={styles.detailGrid}>
            <DetailCell
              label="My weekly rent share"
              value={formatCurrency(rentShare(joinedProperty))}
            />
            <DetailCell
              label="Total property rent"
              value={`${formatCurrency(joinedProperty.weekly_rent)}/wk`}
            />
            <DetailCell label="Bond" value={formatCurrency(joinedProperty.bond)} />
            <DetailCell
              label="Lease start"
              value={joinedProperty.lease_start ?? "—"}
            />
            <DetailCell label="Lease end" value={joinedProperty.lease_end ?? "—"} />
          </View>

          <Text style={[styles.subHeading, { color: theme.textSecondary }]}>Flatmates</Text>
          <View style={styles.flatmates}>
            {MOCK_FLATMATES.slice(0, joinedProperty.flatmate_count + 1).map((f) => (
              <View key={f.name} style={styles.flatmate}>
                <UserAvatar name={f.name} color={f.color} size={40} />
                <Text style={[styles.flatmateName, { color: theme.text }]}>{f.name}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.subHeading, { color: theme.textSecondary }]}>
            Rules & Conditions
          </Text>
          {joinedProperty.rules.map((rule) => (
            <Text key={rule} style={[styles.rule, { color: theme.textMuted }]}>
              • {rule}
            </Text>
          ))}

          <Pressable style={styles.leave} onPress={onLeaveFlat}>
            <Text style={[styles.leaveText, { color: theme.danger }]}>Leave Flat</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.emptyFlat, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.emptyEmoji}>🛏️</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No flat yet</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Search below and request to join a flat
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Search / Join Flat</Text>
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

      {availableToJoin.length === 0 ? (
        <Text style={[styles.emptySearch, { color: theme.textMuted }]}>
          No flats match your search
        </Text>
      ) : (
        availableToJoin.map((property) => {
          const req = getRequestForProperty(property.id);
          const pending = req?.status === "pending";
          const approved = req?.status === "approved";
          const rejected = req?.status === "rejected";
          const hasRequest = pending || approved || rejected;

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
                {formatCurrency(property.weekly_rent)}/wk · Bond {formatCurrency(property.bond)}
              </Text>
              <Text style={[styles.rooms, { color: theme.textMuted }]}>
                {property.available_rooms} room{property.available_rooms !== 1 ? "s" : ""} available
              </Text>

              {!hasRequest && (
                <Pressable
                  style={[styles.joinBtn, { backgroundColor: theme.primary }]}
                  onPress={() => onRequestJoin(property.id)}
                >
                  <Text style={styles.joinBtnText}>Request to Join</Text>
                </Pressable>
              )}
              {pending && (
                <View style={[styles.statusNote, { backgroundColor: theme.warningMuted }]}>
                  <Text style={[styles.statusText, { color: theme.warning }]}>
                    Request pending
                  </Text>
                </View>
              )}
              {rejected && (
                <View style={[styles.statusNote, { backgroundColor: theme.dangerMuted }]}>
                  <Text style={[styles.statusText, { color: theme.danger }]}>
                    Request rejected
                  </Text>
                </View>
              )}
            </View>
          );
        })
      )}

      <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Join Request Status</Text>

      {myJoinRequests.length === 0 ? (
        <View style={[styles.emptyFlat, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            No join requests yet
          </Text>
        </View>
      ) : (
        myJoinRequests.map((req) => {
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
        })
      )}
    </ScreenShell>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.detailCell}>
      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12, marginTop: 8 },
  currentFlat: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 8 },
  image: { width: "100%", height: 140, borderRadius: 16, marginBottom: 14 },
  flatName: { fontSize: 18, fontWeight: "800" },
  address: { fontSize: 14, marginTop: 4, marginBottom: 14 },
  detailGrid: { gap: 10, marginBottom: 14 },
  detailCell: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  detailLabel: { fontSize: 13, flex: 1 },
  detailValue: { fontSize: 13, fontWeight: "700" },
  subHeading: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  flatmates: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 8 },
  flatmate: { alignItems: "center", gap: 6 },
  flatmateName: { fontSize: 12, fontWeight: "600" },
  rule: { fontSize: 13, lineHeight: 20 },
  leave: { paddingVertical: 14, alignItems: "center", marginTop: 12 },
  leaveText: { fontSize: 15, fontWeight: "700" },
  emptyFlat: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 14, marginTop: 4, textAlign: "center" },
  search: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  emptySearch: { fontSize: 14, marginBottom: 14, textAlign: "center" },
  searchCard: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 14 },
  searchImage: { width: "100%", height: 120, borderRadius: 16, marginBottom: 12 },
  rentLine: { fontSize: 14, fontWeight: "700", marginTop: 8 },
  rooms: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  joinBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  joinBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  statusNote: { borderRadius: 12, padding: 12, alignItems: "center" },
  statusText: { fontSize: 14, fontWeight: "700" },
});
