import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  AppCard,
  Badge,
  EmptyState,
  LoadingSpinner,
  ScreenHeader,
} from "@/components";
import { useMaintenance } from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import {
  maintenanceStatusTone,
  priorityTone,
  timeAgo,
  titleCase,
} from "@/utils/format";
import { MaintenanceRequest, MaintenanceStatus } from "@/types";

const FILTERS: { label: string; value: "all" | "open" | "completed" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Completed", value: "completed" },
];

export default function MaintenanceScreen() {
  const { data: requests, isLoading } = useMaintenance();
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");

  const filtered = (requests ?? []).filter((r) => {
    if (filter === "completed") return r.status === "completed";
    if (filter === "open") return r.status !== "completed";
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="Maintenance"
        onBack={() => router.back()}
        rightIcon="add"
        onRightPress={() => router.push("/add-maintenance")}
      />

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            style={[styles.filter, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading requests..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Nothing here"
          message="There are no maintenance requests in this view."
          actionLabel="Report an Issue"
          onAction={() => router.push("/add-maintenance")}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((request) => (
            <MaintenanceCard key={request.id} request={request} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function MaintenanceCard({ request }: { request: MaintenanceRequest }) {
  const sTone = maintenanceStatusTone(request.status as MaintenanceStatus);
  const pTone = priorityTone(request.priority);
  return (
    <AppCard
      style={styles.card}
      onPress={() => router.push(`/maintenance/${request.id}`)}
    >
      <View style={styles.cardTop}>
        <View style={[styles.icon, { backgroundColor: pTone.bg }]}>
          <Ionicons name="construct" size={20} color={pTone.text} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.title} numberOfLines={1}>
            {request.title}
          </Text>
          <Text style={styles.property} numberOfLines={1}>
            {request.property_name}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </View>
      <Text style={styles.desc} numberOfLines={2}>
        {request.description}
      </Text>
      <View style={styles.metaRow}>
        <Badge label={request.status} bg={sTone.bg} text={sTone.text} size="sm" />
        <Badge
          label={request.priority}
          bg={pTone.bg}
          text={pTone.text}
          size="sm"
        />
        <View style={styles.flex} />
        <Text style={styles.time}>{timeAgo(request.created_at)}</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  filter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  filterText: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: colors.primary },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  card: {},
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { color: colors.text, fontSize: 15, fontWeight: "700" },
  property: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  desc: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  time: { color: colors.textFaint, fontSize: 11 },
});
