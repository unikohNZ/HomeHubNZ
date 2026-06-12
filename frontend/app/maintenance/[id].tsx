import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  AppButton,
  AppCard,
  Badge,
  LoadingSpinner,
  ScreenHeader,
} from "@/components";
import { useMaintenance } from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import {
  formatDate,
  maintenanceStatusTone,
  priorityTone,
  titleCase,
} from "@/utils/format";
import { MaintenanceStatus } from "@/types";

const TIMELINE: { status: MaintenanceStatus; label: string }[] = [
  { status: "submitted", label: "Submitted" },
  { status: "reviewing", label: "Reviewing" },
  { status: "assigned", label: "Assigned" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
];

export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = Number(id);
  const { data: requests, isLoading } = useMaintenance();
  const request = requests?.find((r) => r.id === requestId);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LoadingSpinner fullScreen message="Loading request..." />
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Maintenance" />
        <View style={styles.center}>
          <Text style={styles.muted}>Request not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sTone = maintenanceStatusTone(request.status);
  const pTone = priorityTone(request.priority);
  const currentStep = TIMELINE.findIndex((t) => t.status === request.status);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Request Details" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: pTone.bg }]}>
            <Ionicons name="construct" size={26} color={pTone.text} />
          </View>
          <Text style={styles.title}>{request.title}</Text>
          <Text style={styles.property}>{request.property_name}</Text>
          <View style={styles.badges}>
            <Badge label={request.status} bg={sTone.bg} text={sTone.text} />
            <Badge label={request.priority} bg={pTone.bg} text={pTone.text} />
            <Badge
              label={request.category}
              bg={colors.primaryMuted}
              text={colors.primary}
            />
          </View>
        </View>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{request.description}</Text>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <Row label="Submitted by" value={request.submitted_by} />
          <Row label="Assigned to" value={request.assigned_to ?? "Unassigned"} />
          <Row label="Reported" value={formatDate(request.created_at)} last />
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>
          {TIMELINE.map((step, index) => {
            const done = index <= currentStep;
            const isLast = index === TIMELINE.length - 1;
            return (
              <View key={step.status} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.dot,
                      done ? styles.dotDone : styles.dotPending,
                    ]}
                  >
                    {done && (
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.line,
                        index < currentStep ? styles.lineDone : undefined,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    done && styles.timelineLabelDone,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title="Message Contractor"
            variant="secondary"
            icon="chatbubble-outline"
            onPress={() => router.push("/(tabs)/messages")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{titleCase(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: colors.textMuted, fontSize: 14 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  heading: { alignItems: "center", paddingVertical: spacing.lg },
  icon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  property: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
    justifyContent: "center",
  },
  card: { marginBottom: spacing.lg },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  timelineLeft: { alignItems: "center" },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dotDone: { backgroundColor: colors.success },
  dotPending: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  line: { width: 2, height: 24, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.success },
  timelineLabel: {
    color: colors.textMuted,
    fontSize: 14,
    paddingTop: 2,
    fontWeight: "500",
  },
  timelineLabelDone: { color: colors.text, fontWeight: "600" },
  actions: { marginTop: spacing.sm },
});
