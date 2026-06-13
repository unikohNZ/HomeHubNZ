import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { SegmentTabs } from "../components/ui/SegmentTabs";
import { useTheme } from "../context/ThemeContext";
import { MOCK_ALERTS } from "../data/mockAlerts";
import { AlertCategory, AppAlert } from "../data/mockAlerts";
import { radius, spacing } from "../constants/design";

type AlertTab = "all" | AlertCategory;

const TABS: { id: AlertTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "emergency", label: "Emergency" },
  { id: "rent", label: "Rent" },
  { id: "maintenance", label: "Maintenance" },
  { id: "community", label: "Community" },
];

function priorityTone(p: AppAlert["priority"]) {
  if (p === "critical") return "danger" as const;
  if (p === "high") return "warning" as const;
  if (p === "medium") return "accent" as const;
  return "muted" as const;
}

interface AlertsScreenProps {
  onBack: () => void;
  onAction?: (alert: AppAlert) => void;
}

export function AlertsScreen({ onBack, onAction }: AlertsScreenProps) {
  const { theme } = useTheme();
  const [tab, setTab] = useState<AlertTab>("all");

  const filtered = useMemo(
    () => (tab === "all" ? MOCK_ALERTS : MOCK_ALERTS.filter((a) => a.category === tab)),
    [tab],
  );

  return (
    <SubScreenLayout title="Alerts" subtitle="Emergency, rent & community updates" onBack={onBack}>
      <SegmentTabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="✅" title="No alerts" subtitle="You're all clear in this category." />
      ) : (
        filtered.map((alert) => (
          <View
            key={alert.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.top}>
              <Text style={[styles.title, { color: theme.text }]}>{alert.title}</Text>
              <Badge label={alert.priority} tone={priorityTone(alert.priority)} />
            </View>
            <Text style={[styles.msg, { color: theme.textSecondary }]}>{alert.message}</Text>
            <Text style={[styles.time, { color: theme.textMuted }]}>{alert.time}</Text>
            {alert.action_label && (
              <Pressable
                style={[styles.btn, { backgroundColor: theme.primary }]}
                onPress={() => onAction?.(alert)}
              >
                <Text style={styles.btnText}>{alert.action_label}</Text>
              </Pressable>
            )}
          </View>
        ))
      )}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.md },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  title: { fontSize: 16, fontWeight: "800", flex: 1 },
  msg: { fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  time: { fontSize: 12, marginTop: spacing.sm },
  btn: { marginTop: spacing.md, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
