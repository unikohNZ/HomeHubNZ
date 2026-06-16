import { Pressable, StyleSheet, Text, View } from "react-native";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { ScreenShell } from "../components/ScreenShell";
import { Badge } from "../components/ui/Badge";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { LandlordTenant } from "../types/landlord";
import { JoinRequest } from "../types/request";
import { Property } from "../types/property";
import { radius, spacing } from "../constants/design";

const ROOMS = ["Bedroom 1", "Bedroom 2", "Bedroom 3", "Studio", "Spare Room"];

interface TenantsScreenProps {
  properties: Property[];
  joinRequests: JoinRequest[];
  tenants: LandlordTenant[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewProperty: (property: Property) => void;
  onMessageTenant: (conversationId: string) => void;
  onRemoveTenant: (id: string) => void;
  onAssignRoom: (id: string, room: string) => void;
}

export function TenantsScreen({
  properties,
  joinRequests,
  tenants,
  onApprove,
  onReject,
  onViewProperty,
  onMessageTenant,
  onRemoveTenant,
  onAssignRoom,
}: TenantsScreenProps) {
  const { theme } = useTheme();
  const pending = joinRequests.filter((r) => r.status === "pending");

  return (
    <ScreenShell title="Tenants" subtitle="Join requests & flatmate management">
      <SectionHeader title={`Pending Requests (${pending.length})`} />
      {pending.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No pending join requests</Text>
        </View>
      ) : (
        pending.map((req) => {
          const prop = properties.find((p) => p.id === req.property_id);
          return (
            <JoinRequestCard
              key={req.id}
              request={req}
              propertyName={prop?.name ?? "Property"}
              landlordView
              onApprove={() => onApprove(req.id)}
              onReject={() => onReject(req.id)}
            />
          );
        })
      )}

      <SectionHeader title={`Active Tenants (${tenants.length})`} />
      {tenants.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No active tenants yet</Text>
        </View>
      ) : (
        tenants.map((tenant) => (
          <View key={tenant.id} style={[styles.tenantCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.tenantTop}>
              <Text style={[styles.tenantName, { color: theme.text }]}>{tenant.name}</Text>
              <Badge
                label={tenant.rent_status}
                tone={tenant.rent_status === "paid" ? "success" : tenant.rent_status === "overdue" ? "danger" : "warning"}
              />
            </View>
            <Text style={[styles.tenantEmail, { color: theme.textSecondary }]}>{tenant.email}</Text>
            <Text style={[styles.tenantProp, { color: theme.textMuted }]}>
              {tenant.property_name} · {tenant.room_assigned}
            </Text>

            <View style={styles.roomRow}>
              <Text style={[styles.roomLabel, { color: theme.textSecondary }]}>Assign room:</Text>
              <View style={styles.roomChips}>
                {ROOMS.map((room) => (
                  <Pressable
                    key={room}
                    style={[
                      styles.roomChip,
                      {
                        backgroundColor: tenant.room_assigned === room ? theme.primaryMuted : theme.bg,
                        borderColor: tenant.room_assigned === room ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => onAssignRoom(tenant.id, room)}
                  >
                    <Text
                      style={{
                        color: tenant.room_assigned === room ? theme.primary : theme.textMuted,
                        fontSize: 11,
                        fontWeight: "600",
                      }}
                    >
                      {room}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              {tenant.conversation_id && (
                <Pressable
                  style={[styles.msgBtn, { backgroundColor: theme.primaryMuted }]}
                  onPress={() => onMessageTenant(tenant.conversation_id!)}
                >
                  <Text style={[styles.msgText, { color: theme.primary }]}>Message</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.removeBtn, { borderColor: theme.danger }]}
                onPress={() => onRemoveTenant(tenant.id)}
              >
                <Text style={[styles.removeText, { color: theme.danger }]}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <SectionHeader title="Properties" />
      {properties.map((p) => (
        <Pressable
          key={p.id}
          style={[styles.propLink, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => onViewProperty(p)}
        >
          <Text style={[styles.propName, { color: theme.text }]}>{p.name}</Text>
          <Text style={[styles.propMeta, { color: theme.textMuted }]}>
            {p.flatmate_count}/{p.max_flatmates} occupied · {p.address}
          </Text>
          <Text style={[styles.viewLink, { color: theme.primary }]}>View details →</Text>
        </Pressable>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.xl, alignItems: "center", marginBottom: spacing.lg },
  emptyText: { fontSize: 14 },
  tenantCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  tenantTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tenantName: { fontSize: 16, fontWeight: "800", flex: 1 },
  tenantEmail: { fontSize: 13, marginTop: 4 },
  tenantProp: { fontSize: 12, marginTop: 2 },
  roomRow: { marginTop: spacing.md },
  roomLabel: { fontSize: 12, fontWeight: "700", marginBottom: spacing.sm },
  roomChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  roomChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  msgBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: "center" },
  msgText: { fontWeight: "700", fontSize: 14 },
  removeBtn: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  removeText: { fontWeight: "700", fontSize: 14 },
  propLink: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  propName: { fontSize: 16, fontWeight: "800" },
  propMeta: { fontSize: 13, marginTop: 4 },
  viewLink: { fontSize: 13, fontWeight: "700", marginTop: spacing.sm },
});
