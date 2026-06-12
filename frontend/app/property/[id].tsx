import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { useMaintenance, useProperty } from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import {
  formatCurrency,
  formatDate,
  inspectionTone,
  maintenanceStatusTone,
  titleCase,
} from "@/utils/format";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = Number(id);
  const { data: property, isLoading } = useProperty(propertyId);
  const { data: maintenance } = useMaintenance();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LoadingSpinner fullScreen message="Loading property..." />
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader title="Property" />
        <View style={styles.center}>
          <Text style={styles.muted}>Property not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const relatedMaintenance = (maintenance ?? []).filter(
    (m) => m.property_id === property.id,
  );
  const tone = inspectionTone(property.inspection_status);

  const specs = [
    { icon: "bed-outline" as const, label: "Bedrooms", value: String(property.bedrooms) },
    { icon: "water-outline" as const, label: "Bathrooms", value: String(property.bathrooms) },
    { icon: "people-outline" as const, label: "Tenants", value: String(property.tenant_count) },
    { icon: "business-outline" as const, label: "Type", value: titleCase(property.property_type) },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Property Details" rightIcon="share-outline" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: property.image_url }} style={styles.hero} />

        <View style={styles.titleRow}>
          <View style={styles.flex}>
            <Text style={styles.name}>{property.name}</Text>
            <Text style={styles.address}>{property.full_address}</Text>
          </View>
          <Badge
            label={titleCase(property.inspection_status)}
            bg={tone.bg}
            text={tone.text}
          />
        </View>

        <View style={styles.specGrid}>
          {specs.map((s) => (
            <View key={s.label} style={styles.spec}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
              <Text style={styles.specValue}>{s.value}</Text>
              <Text style={styles.specLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <AppCard style={styles.leaseCard}>
          <Text style={styles.cardTitle}>Lease & Financials</Text>
          <DetailRow
            label="Weekly Rent"
            value={`${formatCurrency(property.rent_amount)}/${property.rent_frequency}`}
          />
          <DetailRow label="Bond" value={formatCurrency(property.bond_amount)} />
          <DetailRow
            label="Lease Start"
            value={formatDate(property.lease_start)}
          />
          <DetailRow label="Lease End" value={formatDate(property.lease_end)} />
          <DetailRow
            label="Next Inspection"
            value={formatDate(property.next_inspection)}
            last
          />
        </AppCard>

        {property.description && (
          <AppCard style={styles.leaseCard}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.description}>{property.description}</Text>
          </AppCard>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Maintenance</Text>
          <Text style={styles.muted}>{relatedMaintenance.length} requests</Text>
        </View>
        {relatedMaintenance.length === 0 ? (
          <AppCard>
            <Text style={styles.muted}>No maintenance requests logged.</Text>
          </AppCard>
        ) : (
          <View style={styles.maintList}>
            {relatedMaintenance.map((m) => {
              const mt = maintenanceStatusTone(m.status);
              return (
                <AppCard
                  key={m.id}
                  style={styles.maintRow}
                  onPress={() => router.push(`/maintenance/${m.id}`)}
                >
                  <View
                    style={[styles.maintIcon, { backgroundColor: mt.bg }]}
                  >
                    <Ionicons name="construct" size={18} color={mt.text} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.maintTitle}>{m.title}</Text>
                    <Text style={styles.muted}>{titleCase(m.status)}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textFaint}
                  />
                </AppCard>
              );
            })}
          </View>
        )}

        <AppCard style={styles.docsCard}>
          <View style={styles.docsRow}>
            <View style={styles.docIcon}>
              <Ionicons name="folder-open" size={20} color={colors.warning} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.maintTitle}>Documents</Text>
              <Text style={styles.muted}>Lease, bond lodgement, insurance</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </View>
        </AppCard>

        <View style={styles.actions}>
          <AppButton
            title="Report an Issue"
            variant="secondary"
            icon="construct-outline"
            onPress={() => router.push("/add-maintenance")}
          />
          <View style={{ height: spacing.md }} />
          <AppButton
            title="Record Payment"
            icon="card-outline"
            onPress={() => router.push("/add-payment")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingBottom: spacing.xxxl },
  hero: {
    width: "100%",
    height: 220,
    backgroundColor: colors.surfaceElevated,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  name: { color: colors.text, fontSize: 22, fontWeight: "800" },
  address: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  specGrid: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  spec: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: 4,
  },
  specValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  specLabel: { color: colors.textMuted, fontSize: 11 },
  leaseCard: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.textMuted, fontSize: 14 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  description: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  muted: { color: colors.textMuted, fontSize: 13 },
  maintList: { paddingHorizontal: spacing.xl, gap: spacing.md },
  maintRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  maintIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  maintTitle: { color: colors.text, fontSize: 14, fontWeight: "600" },
  docsCard: { marginHorizontal: spacing.xl, marginTop: spacing.lg },
  docsRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.warningMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
});
