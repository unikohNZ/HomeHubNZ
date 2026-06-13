import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { VisitorEntry } from "../types/flatExtended";

interface VisitorsScreenProps {
  visitors: VisitorEntry[];
  onBack: () => void;
  onAdd: (name: string, overnight: boolean) => void;
  onApprove: (id: string) => void;
}

export function VisitorsScreen({ visitors, onBack, onAdd, onApprove }: VisitorsScreenProps) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [overnight, setOvernight] = useState(false);
  const upcoming = visitors.filter((v) => v.upcoming);
  const history = visitors.filter((v) => !v.upcoming);

  return (
    <SubScreenLayout title="Visitor Log" subtitle="Register and track guests" onBack={onBack}>
      <View style={[styles.form, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
          placeholder="Visitor name"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Overnight stay</Text>
          <Switch value={overnight} onValueChange={setOvernight} trackColor={{ true: theme.primary }} />
        </View>
        <Pressable style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => { if (name.trim()) { onAdd(name.trim(), overnight); setName(""); } }}>
          <Text style={styles.addBtnText}>Register Visitor</Text>
        </Pressable>
      </View>

      <Text style={[styles.section, { color: theme.text }]}>Upcoming ({upcoming.length})</Text>
      {upcoming.map((v) => <VisitorCard key={v.id} visitor={v} onApprove={onApprove} />)}

      <Text style={[styles.section, { color: theme.text, marginTop: 12 }]}>History</Text>
      {history.map((v) => <VisitorCard key={v.id} visitor={v} onApprove={onApprove} />)}
    </SubScreenLayout>
  );
}

function VisitorCard({ visitor, onApprove }: { visitor: VisitorEntry; onApprove: (id: string) => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.vName, { color: theme.text }]}>{visitor.visitor_name}</Text>
      <Text style={[styles.meta, { color: theme.textMuted }]}>Host: {visitor.host} · {visitor.date}</Text>
      <Text style={[styles.meta, { color: theme.textMuted }]}>{visitor.overnight ? "Overnight" : "Day visit"}</Text>
      <View style={[styles.badge, { backgroundColor: visitor.approved ? theme.successMuted : theme.warningMuted }]}>
        <Text style={{ color: visitor.approved ? theme.success : theme.warning, fontWeight: "700", fontSize: 12 }}>
          {visitor.approved ? "Approved" : "Pending"}
        </Text>
      </View>
      {!visitor.approved && visitor.upcoming && (
        <Pressable style={[styles.approveBtn, { backgroundColor: theme.primary }]} onPress={() => onApprove(visitor.id)}>
          <Text style={styles.approveText}>Approve</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 16 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 15, marginBottom: 12 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  switchLabel: { fontSize: 15, fontWeight: "600" },
  addBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "700" },
  section: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 8 },
  vName: { fontSize: 16, fontWeight: "800" },
  meta: { fontSize: 13, marginTop: 4 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 8 },
  approveBtn: { borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 10 },
  approveText: { color: "#fff", fontWeight: "700" },
});
