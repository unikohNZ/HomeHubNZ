import { Pressable, StyleSheet, Text, View } from "react-native";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { PropertyCard } from "../components/PropertyCard";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { JoinRequest } from "../types/request";
import { Property } from "../types/property";
import { radius, spacing } from "../constants/design";

interface TenantsScreenProps {
  properties: Property[];
  joinRequests: JoinRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewProperty: (property: Property) => void;
}

export function TenantsScreen({
  properties,
  joinRequests,
  onApprove,
  onReject,
  onViewProperty,
}: TenantsScreenProps) {
  const { theme } = useTheme();
  const pending = joinRequests.filter((r) => r.status === "pending");
  const approved = joinRequests.filter((r) => r.status === "approved");

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
            <View key={req.id}>
              <JoinRequestCard
                request={req}
                propertyName={prop?.name ?? "Property"}
              />
              <View style={styles.actions}>
                <Pressable
                  style={[styles.approve, { backgroundColor: theme.success }]}
                  onPress={() => onApprove(req.id)}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.reject, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}
                  onPress={() => onReject(req.id)}
                >
                  <Text style={[styles.rejectText, { color: theme.danger }]}>Reject</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      <SectionHeader title={`Active Tenants (${approved.length})`} />
      {approved.map((req) => {
        const prop = properties.find((p) => p.id === req.property_id);
        if (!prop) return null;
        return (
          <View key={req.id} style={[styles.tenantCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.tenantName, { color: theme.text }]}>{req.flatmate_name}</Text>
            <Text style={[styles.tenantProp, { color: theme.textMuted }]}>{prop.name}</Text>
            <Text style={[styles.tenantEmail, { color: theme.textSecondary }]}>{req.flatmate_email}</Text>
          </View>
        );
      })}

      <SectionHeader title="Properties" />
      {properties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          showControls={false}
          onPress={() => onViewProperty(p)}
        />
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  empty: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.xl, alignItems: "center", marginBottom: spacing.lg },
  emptyText: { fontSize: 14 },
  actions: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg, marginTop: -6 },
  approve: { flex: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: "center" },
  reject: { flex: 1, borderRadius: radius.md, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
  rejectText: { fontWeight: "700" },
  tenantCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  tenantName: { fontSize: 16, fontWeight: "800" },
  tenantProp: { fontSize: 13, marginTop: 4 },
  tenantEmail: { fontSize: 12, marginTop: 2 },
});
