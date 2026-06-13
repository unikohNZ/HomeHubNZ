import { StyleSheet, Text, View } from "react-native";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { JoinRequest } from "../types/request";
import { Property } from "../types/property";

interface RequestsScreenProps {
  properties: Property[];
  joinRequests: JoinRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestsScreen({
  properties,
  joinRequests,
  onApprove,
  onReject,
}: RequestsScreenProps) {
  const { theme } = useTheme();
  const pending = joinRequests.filter((r) => r.status === "pending");
  const resolved = joinRequests.filter((r) => r.status !== "pending");

  return (
    <ScreenShell title="Requests" subtitle="Review flatmate join requests">
      <Text style={[styles.section, { color: theme.text }]}>
        Pending ({pending.length})
      </Text>

      {pending.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No pending requests
          </Text>
        </View>
      ) : (
        pending.map((req) => {
          const prop = properties.find((p) => p.id === req.property_id);
          return (
            <JoinRequestCard
              key={req.id}
              request={req}
              propertyName={prop?.name ?? "Unknown"}
              landlordView
              onApprove={() => onApprove(req.id)}
              onReject={() => onReject(req.id)}
            />
          );
        })
      )}

      {resolved.length > 0 && (
        <>
          <Text style={[styles.section, { color: theme.text, marginTop: 16 }]}>
            Resolved ({resolved.length})
          </Text>
          {resolved.map((req) => {
            const prop = properties.find((p) => p.id === req.property_id);
            return (
              <JoinRequestCard
                key={req.id}
                request={req}
                propertyName={prop?.name ?? "Unknown"}
                landlordView
              />
            );
          })}
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  empty: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14 },
});
