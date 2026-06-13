import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { JoinRequest } from "../types/request";
import { titleCase } from "../utils/format";
import { Card } from "./Card";

interface JoinRequestCardProps {
  request: JoinRequest;
  propertyName: string;
  landlordView?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

export function JoinRequestCard({
  request,
  propertyName,
  landlordView,
  onApprove,
  onReject,
  onCancel,
}: JoinRequestCardProps) {
  const { theme } = useTheme();
  const tone =
    request.status === "approved"
      ? theme.success
      : request.status === "rejected"
        ? theme.danger
        : theme.warning;
  const toneBg =
    request.status === "approved"
      ? theme.successMuted
      : request.status === "rejected"
        ? theme.dangerMuted
        : theme.warningMuted;

  return (
    <Card>
      <View style={styles.top}>
        <Text style={[styles.name, { color: theme.text }]}>
          {landlordView ? request.flatmate_name : propertyName}
        </Text>
        <View style={[styles.badge, { backgroundColor: toneBg }]}>
          <Text style={[styles.badgeText, { color: tone }]}>
            {titleCase(request.status)}
          </Text>
        </View>
      </View>
      {landlordView && (
        <Text style={[styles.sub, { color: theme.textMuted }]}>
          Wants to join: {propertyName}
        </Text>
      )}
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {request.message}
      </Text>
      <Text style={[styles.time, { color: theme.textMuted }]}>{request.created_at}</Text>

      {landlordView && request.status === "pending" && (
        <View style={styles.actions}>
          <Pressable
            style={[styles.approve, { backgroundColor: theme.success }]}
            onPress={onApprove}
          >
            <Text style={styles.btnText}>Approve</Text>
          </Pressable>
          <Pressable
            style={[styles.reject, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}
            onPress={onReject}
          >
            <Text style={[styles.rejectText, { color: theme.danger }]}>Reject</Text>
          </Pressable>
        </View>
      )}

      {!landlordView && request.status === "pending" && onCancel && (
        <Pressable style={styles.cancel} onPress={onCancel}>
          <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel Request</Text>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "800", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 6 },
  message: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  time: { fontSize: 12, marginTop: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  approve: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  reject: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  rejectText: { fontSize: 14, fontWeight: "700" },
  cancel: { paddingVertical: 10, alignItems: "center", marginTop: 8 },
  cancelText: { fontSize: 14, fontWeight: "600" },
});
