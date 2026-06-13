import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { MaintenanceRequest, MaintenanceStatus } from "../types/flat";
import { titleCase } from "../utils/format";

const ALL_STATUSES: MaintenanceStatus[] = [
  "submitted",
  "reviewed",
  "assigned",
  "in_progress",
  "completed",
];

interface MaintenanceScreenProps {
  requests: MaintenanceRequest[];
  onBack: () => void;
  onAdd: (title: string) => void;
  onMessageContractor: (conversationId: string) => void;
  onResolve: (id: string) => void;
}

export function MaintenanceScreen({
  requests,
  onBack,
  onAdd,
  onMessageContractor,
  onResolve,
}: MaintenanceScreenProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <SubScreenLayout title="Maintenance" subtitle="Track repairs like parcel delivery" onBack={onBack}>
      <View style={[styles.addBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
          placeholder="Describe new issue..."
          placeholderTextColor={theme.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <Pressable
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            if (title.trim()) {
              onAdd(title.trim());
              setTitle("");
            }
          }}
        >
          <Text style={styles.addBtnText}>Submit Request</Text>
        </Pressable>
      </View>

      {requests.map((req) => {
        const expanded = expandedId === req.id;
        const statusIdx = ALL_STATUSES.indexOf(req.status);

        return (
          <Pressable
            key={req.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setExpandedId(expanded ? null : req.id)}
          >
            <View style={styles.top}>
              <Text style={[styles.title, { color: theme.text }]}>{req.title}</Text>
              <View style={[styles.badge, { backgroundColor: theme.primaryMuted }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {titleCase(req.status.replace("_", " "))}
                </Text>
              </View>
            </View>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {req.property} · Submitted {req.submitted_date}
            </Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {req.contractor} · Expected {req.expected_completion} · {titleCase(req.priority)}
            </Text>

            {expanded && (
              <View style={styles.timeline}>
                <Text style={[styles.timelineTitle, { color: theme.textSecondary }]}>Timeline</Text>
                {ALL_STATUSES.map((step, i) => {
                  const done = i <= statusIdx;
                  return (
                    <View key={step} style={styles.step}>
                      <View
                        style={[
                          styles.stepDot,
                          { backgroundColor: done ? theme.success : theme.border },
                        ]}
                      />
                      <Text
                        style={[
                          styles.stepText,
                          { color: done ? theme.text : theme.textMuted },
                        ]}
                      >
                        {titleCase(step.replace("_", " "))}
                      </Text>
                    </View>
                  );
                })}
                <View style={styles.actions}>
                  {req.conversation_id && (
                    <Pressable
                      style={[styles.btn, { backgroundColor: theme.primaryMuted }]}
                      onPress={() => onMessageContractor(req.conversation_id!)}
                    >
                      <Text style={[styles.btnText, { color: theme.primary }]}>
                        Message Contractor
                      </Text>
                    </Pressable>
                  )}
                  {req.status !== "completed" && (
                    <Pressable
                      style={[styles.btn, { backgroundColor: theme.success }]}
                      onPress={() => onResolve(req.id)}
                    >
                      <Text style={styles.btnTextWhite}>Mark Resolved</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  addBox: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 14 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15, marginBottom: 10 },
  addBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "700" },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  top: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  title: { fontSize: 16, fontWeight: "800", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  meta: { fontSize: 13, marginTop: 4 },
  timeline: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#1e3a5f33" },
  timelineTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginBottom: 10 },
  step: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepText: { fontSize: 13, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnText: { fontWeight: "700", fontSize: 13 },
  btnTextWhite: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
