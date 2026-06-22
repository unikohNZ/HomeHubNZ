import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenShell } from "../components/ScreenShell";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { MaintenanceRequest, MaintenanceStatus } from "../types/flat";
import { titleCase } from "../utils/format";
import { radius, spacing } from "../constants/design";

const ALL_STATUSES: MaintenanceStatus[] = [
  "submitted",
  "reviewed",
  "assigned",
  "in_progress",
  "completed",
];

const CONTRACTORS = ["Bay Heating Ltd", "FlowRight Plumbing", "Sparky Solutions", "QuickFix Maintenance"];

interface LandlordMaintenanceScreenProps {
  requests: MaintenanceRequest[];
  onUpdateStatus: (id: string, status: MaintenanceStatus) => void;
  onAssignContractor: (id: string, contractor: string) => void;
  onAddNote: (id: string, note: string) => void;
  onMarkCompleted: (id: string) => void;
  onMessageContractor: (conversationId: string) => void;
  onBack?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function LandlordMaintenanceScreen({
  requests,
  onUpdateStatus,
  onAssignContractor,
  onAddNote,
  onMarkCompleted,
  onMessageContractor,
  onBack,
  refreshing,
  onRefresh,
}: LandlordMaintenanceScreenProps) {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const open = requests.filter((r) => r.status !== "completed");
  const done = requests.filter((r) => r.status === "completed");

  return (
    <ScreenShell
      onBack={onBack}
      title="Maintenance"
      subtitle="Manage repairs & contractors"
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <SectionHeader title={`Open Requests (${open.length})`} />
      {open.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>No open maintenance requests</Text>
      ) : (
        open.map((req) => (
          <MaintenanceCard
            key={req.id}
            req={req}
            expanded={expandedId === req.id}
            noteValue={noteDraft[req.id] ?? req.landlord_note ?? ""}
            onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
            onNoteChange={(v) => setNoteDraft((d) => ({ ...d, [req.id]: v }))}
            onUpdateStatus={onUpdateStatus}
            onAssignContractor={onAssignContractor}
            onAddNote={onAddNote}
            onMarkCompleted={onMarkCompleted}
            onMessageContractor={onMessageContractor}
          />
        ))
      )}

      <SectionHeader title={`Completed (${done.length})`} />
      {done.map((req) => (
        <View key={req.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{req.title}</Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            {req.property} · {req.contractor}
          </Text>
        </View>
      ))}
    </ScreenShell>
  );
}

function MaintenanceCard({
  req,
  expanded,
  noteValue,
  onToggle,
  onNoteChange,
  onUpdateStatus,
  onAssignContractor,
  onAddNote,
  onMarkCompleted,
  onMessageContractor,
}: {
  req: MaintenanceRequest;
  expanded: boolean;
  noteValue: string;
  onToggle: () => void;
  onNoteChange: (v: string) => void;
  onUpdateStatus: (id: string, status: MaintenanceStatus) => void;
  onAssignContractor: (id: string, contractor: string) => void;
  onAddNote: (id: string, note: string) => void;
  onMarkCompleted: (id: string) => void;
  onMessageContractor: (id: string) => void;
}) {
  const { theme } = useTheme();
  const statusIdx = ALL_STATUSES.indexOf(req.status);
  const nextStatus = ALL_STATUSES[Math.min(statusIdx + 1, ALL_STATUSES.length - 1)];

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onToggle}
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
        {req.property} · {req.submitted_date}
      </Text>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {req.contractor} · {titleCase(req.priority)} priority
      </Text>

      {expanded && (
        <View style={styles.expanded}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Update status</Text>
          <View style={styles.btnRow}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.primaryMuted }]}
              onPress={() => onUpdateStatus(req.id, nextStatus)}
            >
              <Text style={[styles.actionText, { color: theme.primary }]}>
                → {titleCase(nextStatus.replace("_", " "))}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.success }]}
              onPress={() => onMarkCompleted(req.id)}
            >
              <Text style={styles.actionTextWhite}>Mark Completed</Text>
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Assign contractor</Text>
          <View style={styles.chips}>
            {CONTRACTORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.chip,
                  {
                    backgroundColor: req.contractor === c ? theme.primaryMuted : theme.bg,
                    borderColor: req.contractor === c ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => onAssignContractor(req.id, c)}
              >
                <Text style={{ color: req.contractor === c ? theme.primary : theme.textSecondary, fontSize: 12, fontWeight: "600" }}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Landlord note</Text>
          <TextInput
            style={[styles.noteInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
            value={noteValue}
            onChangeText={onNoteChange}
            placeholder="Add a note for this request..."
            placeholderTextColor={theme.textMuted}
            multiline
          />
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.accentMuted }]}
            onPress={() => noteValue.trim() && onAddNote(req.id, noteValue.trim())}
          >
            <Text style={[styles.actionText, { color: theme.accent }]}>Save Note</Text>
          </Pressable>

          {req.landlord_note && (
            <Text style={[styles.savedNote, { color: theme.textMuted }]}>Note: {req.landlord_note}</Text>
          )}

          {req.conversation_id && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={() => onMessageContractor(req.conversation_id!)}
            >
              <Text style={styles.actionTextWhite}>Message Contractor</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 14, marginBottom: spacing.lg },
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  top: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  title: { fontSize: 16, fontWeight: "800", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  meta: { fontSize: 13, marginTop: 4 },
  expanded: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: "#1e3a5f33" },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", marginTop: spacing.md, marginBottom: spacing.sm },
  btnRow: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: "center", marginTop: spacing.sm },
  actionText: { fontWeight: "700", fontSize: 13 },
  actionTextWhite: { color: "#fff", fontWeight: "700", fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  noteInput: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md, fontSize: 14, minHeight: 72, textAlignVertical: "top" },
  savedNote: { fontSize: 13, marginTop: spacing.sm, fontStyle: "italic" },
});
