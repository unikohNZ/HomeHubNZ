import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatusBadge } from "../components/StatusBadge";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";
import { MaintenanceHistoryItem } from "../types/flatExtended";
import { LandlordDocument, LandlordTenant } from "../types/landlord";
import { Property } from "../types/property";
import { RentPayment } from "../types/rent";
import { formatCurrency } from "../utils/format";

interface PropertyDetailScreenProps {
  property: Property;
  tenants: LandlordTenant[];
  documents: LandlordDocument[];
  rentHistory: RentPayment[];
  maintenanceHistory: MaintenanceHistoryItem[];
  onBack: () => void;
  onEdit: () => void;
  onUploadDocument: () => void;
  onMessageTenant: (conversationId: string) => void;
}

export function PropertyDetailScreen({
  property,
  tenants,
  documents,
  rentHistory,
  maintenanceHistory,
  onBack,
  onEdit,
  onUploadDocument,
  onMessageTenant,
}: PropertyDetailScreenProps) {
  const { theme } = useTheme();
  const propertyTenants = tenants.filter((t) => t.property_id === property.id);
  const propertyRent = rentHistory.filter((r) => r.property_id === property.id);
  const occupancy = `${property.flatmate_count}/${property.max_flatmates}`;

  return (
    <SubScreenLayout title={property.name} subtitle={property.address} onBack={onBack}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: property.image_url }} style={styles.hero} />
        <Text style={[styles.address, { color: theme.textSecondary }]}>
          {property.address}, {property.suburb}, {property.city}
        </Text>

        <View style={styles.statsRow}>
          <StatChip label="Weekly Rent" value={formatCurrency(property.weekly_rent)} theme={theme} />
          <StatChip label="Bond" value={formatCurrency(property.bond)} theme={theme} />
          <StatChip label="Occupancy" value={occupancy} theme={theme} />
        </View>

        <Pressable style={[styles.editBtn, { backgroundColor: theme.primary }]} onPress={onEdit}>
          <Text style={styles.editBtnText}>Edit Property</Text>
        </Pressable>

        <SectionHeader title={`Tenants (${propertyTenants.length})`} />
        {propertyTenants.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>No tenants assigned yet</Text>
        ) : (
          propertyTenants.map((t) => (
            <View key={t.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{t.name}</Text>
                <StatusBadge label={t.rent_status} status={t.rent_status} />
              </View>
              <Text style={[styles.meta, { color: theme.textMuted }]}>{t.email}</Text>
              <Text style={[styles.meta, { color: theme.textSecondary }]}>Room: {t.room_assigned}</Text>
              {t.conversation_id && (
                <Pressable
                  style={[styles.smallBtn, { backgroundColor: theme.primaryMuted }]}
                  onPress={() => onMessageTenant(t.conversation_id!)}
                >
                  <Text style={[styles.smallBtnText, { color: theme.primary }]}>Message</Text>
                </Pressable>
              )}
            </View>
          ))
        )}

        <SectionHeader title="Rules & Conditions" />
        {property.rules.map((rule) => (
          <Text key={rule} style={[styles.rule, { color: theme.textMuted }]}>• {rule}</Text>
        ))}

        <SectionHeader title="Maintenance History" />
        {maintenanceHistory.slice(0, 3).map((m) => (
          <View key={m.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{m.title}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>
              {m.date} · {m.contractor} · {formatCurrency(m.cost)}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{m.notes}</Text>
          </View>
        ))}

        <SectionHeader title="Rent History" />
        {propertyRent.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>No rent records yet</Text>
        ) : (
          propertyRent.slice(0, 5).map((r) => (
            <View key={r.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardTop}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{formatCurrency(r.amount)}</Text>
                <StatusBadge
                  label={r.payment_date ? "Paid" : "Due"}
                  status={r.payment_date ? "paid" : "pending"}
                />
              </View>
              <Text style={[styles.meta, { color: theme.textMuted }]}>
                Due {r.due_date}{r.payment_date ? ` · Paid ${r.payment_date}` : ""}
              </Text>
            </View>
          ))
        )}

        <SectionHeader title="Documents" />
        {documents.map((doc) => (
          <View key={doc.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{doc.title}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>{doc.file_name}</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>Uploaded {doc.upload_date}</Text>
          </View>
        ))}
        <Pressable
          style={[styles.outlineBtn, { borderColor: theme.primary }]}
          onPress={onUploadDocument}
        >
          <Text style={[styles.outlineBtnText, { color: theme.primary }]}>Upload Document (mock)</Text>
        </Pressable>
      </ScrollView>
    </SubScreenLayout>
  );
}

function StatChip({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", height: 180, borderRadius: radius.xl, marginBottom: spacing.md },
  address: { fontSize: 14, marginBottom: spacing.lg },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  stat: { flex: 1, minWidth: "30%", borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  statValue: { fontSize: 15, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  editBtn: { borderRadius: radius.lg, paddingVertical: 14, alignItems: "center", marginBottom: spacing.lg },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  card: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, marginBottom: spacing.sm },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  cardTitle: { fontSize: 15, fontWeight: "800", flex: 1 },
  meta: { fontSize: 13, marginTop: 4 },
  rule: { fontSize: 14, lineHeight: 22, marginBottom: 4 },
  empty: { fontSize: 14, marginBottom: spacing.lg },
  smallBtn: { marginTop: spacing.sm, borderRadius: radius.md, paddingVertical: 8, alignItems: "center" },
  smallBtnText: { fontWeight: "700", fontSize: 13 },
  outlineBtn: { borderRadius: radius.lg, borderWidth: 1, paddingVertical: 14, alignItems: "center", marginBottom: spacing.xxl },
  outlineBtnText: { fontWeight: "700", fontSize: 14 },
});
