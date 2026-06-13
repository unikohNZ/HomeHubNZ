import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { AlertStatusBanner } from "../components/ui/AlertStatusBanner";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import {
  CIVIL_DEFENCE_INFO,
  EMERGENCY_GUIDES,
  EMERGENCY_HUB_CONTACTS,
  EMERGENCY_KIT_ITEMS,
  SAFE_MEETING_POINT,
} from "../data/mockEmergency";
import { CURRENT_EMERGENCY_STATUS } from "../data/mockAlerts";
import { radius, spacing } from "../constants/design";

interface EmergencyHubScreenProps {
  onBack: () => void;
  onCall?: (name: string, phone: string) => void;
}

export function EmergencyHubScreen({ onBack, onCall }: EmergencyHubScreenProps) {
  const { theme } = useTheme();
  const [kit, setKit] = useState(EMERGENCY_KIT_ITEMS);
  const checked = kit.filter((k) => k.checked).length;
  const pct = Math.round((checked / kit.length) * 100);

  const statusLevel =
    CURRENT_EMERGENCY_STATUS === "emergency"
      ? "emergency"
      : CURRENT_EMERGENCY_STATUS === "watch"
        ? "watch"
        : "normal";

  return (
    <SubScreenLayout title="Emergency Hub" subtitle="NZ Civil Defence & flat safety" onBack={onBack}>
      <AlertStatusBanner
        level={statusLevel}
        title={
          statusLevel === "normal"
            ? "All clear — no active emergencies"
            : statusLevel === "watch"
              ? "Weather watch in effect"
              : "Emergency alert active"
        }
        subtitle="Stay informed via official NZ channels"
      />

      <View style={[styles.civil, { backgroundColor: theme.primaryMuted, borderColor: theme.primary }]}>
        <Text style={[styles.civilTitle, { color: theme.primary }]}>{CIVIL_DEFENCE_INFO.title}</Text>
        <Text style={[styles.civilText, { color: theme.text }]}>{CIVIL_DEFENCE_INFO.summary}</Text>
        <Text style={[styles.civilMeta, { color: theme.textSecondary }]}>
          Emergency: {CIVIL_DEFENCE_INFO.emergency} · {CIVIL_DEFENCE_INFO.website}
        </Text>
      </View>

      <SectionHeader title="Emergency Guides" />
      {EMERGENCY_GUIDES.map((g) => (
        <View key={g.id} style={[styles.guide, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.guideIcon}>{g.icon}</Text>
          <View style={styles.flex}>
            <Text style={[styles.guideTitle, { color: theme.text }]}>{g.title}</Text>
            <Text style={[styles.guideSum, { color: theme.textSecondary }]}>{g.summary}</Text>
            {g.tips.slice(0, 2).map((t) => (
              <Text key={t} style={[styles.tip, { color: theme.textMuted }]}>• {t}</Text>
            ))}
          </View>
        </View>
      ))}

      <SectionHeader title={`Emergency Kit (${pct}%)`} />
      {kit.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.kitRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() =>
            setKit((prev) =>
              prev.map((k) => (k.id === item.id ? { ...k, checked: !k.checked } : k)),
            )
          }
        >
          <Text style={styles.check}>{item.checked ? "☑" : "☐"}</Text>
          <Text style={[styles.kitLabel, { color: theme.text }]}>{item.label}</Text>
        </Pressable>
      ))}

      <SectionHeader title="Safe Meeting Point" />
      <View style={[styles.meeting, { backgroundColor: theme.accentMuted, borderColor: theme.accent }]}>
        <Text style={[styles.meetingTitle, { color: theme.text }]}>{SAFE_MEETING_POINT.label}</Text>
        <Text style={[styles.meetingAddr, { color: theme.textSecondary }]}>
          {SAFE_MEETING_POINT.address}
        </Text>
        <Text style={[styles.meetingNote, { color: theme.textMuted }]}>{SAFE_MEETING_POINT.notes}</Text>
      </View>

      <SectionHeader title="Emergency Contacts" />
      {EMERGENCY_HUB_CONTACTS.map((c) => (
        <Pressable
          key={c.id}
          style={[styles.contact, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => {
            onCall?.(c.name, c.phone);
            Linking.openURL(`tel:${c.phone.replace(/\s/g, "")}`).catch(() => {});
          }}
        >
          <View style={styles.flex}>
            <Text style={[styles.contactName, { color: theme.text }]}>{c.name}</Text>
            <Text style={[styles.contactRole, { color: theme.textMuted }]}>{c.role}</Text>
          </View>
          <Text style={[styles.phone, { color: theme.primary }]}>{c.phone}</Text>
        </Pressable>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  civil: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.lg },
  civilTitle: { fontSize: 15, fontWeight: "800" },
  civilText: { fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  civilMeta: { fontSize: 12, marginTop: spacing.sm },
  guide: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  guideIcon: { fontSize: 28 },
  flex: { flex: 1 },
  guideTitle: { fontSize: 15, fontWeight: "800" },
  guideSum: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  tip: { fontSize: 12, marginTop: 4 },
  kitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  check: { fontSize: 18 },
  kitLabel: { fontSize: 14, fontWeight: "600", flex: 1 },
  meeting: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  meetingTitle: { fontSize: 16, fontWeight: "800" },
  meetingAddr: { fontSize: 14, marginTop: 4 },
  meetingNote: { fontSize: 13, marginTop: spacing.sm, lineHeight: 18 },
  contact: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  contactName: { fontSize: 15, fontWeight: "700" },
  contactRole: { fontSize: 12, marginTop: 2 },
  phone: { fontSize: 14, fontWeight: "700" },
});
