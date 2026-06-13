import { Pressable, StyleSheet, Text, View } from "react-native";
import { JoinRequestCard } from "../components/JoinRequestCard";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyFormModal } from "../components/PropertyFormModal";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { JoinRequest } from "../types/request";
import { Property, PropertyFormData } from "../types/property";
import { formatCurrency } from "../utils/format";

interface LandlordScreenProps {
  properties: Property[];
  joinRequests: JoinRequest[];
  pendingCount: number;
  monthlyIncome: number;
  showForm: boolean;
  editing: boolean;
  form: PropertyFormData;
  onFormChange: (key: keyof PropertyFormData, value: string) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSave: () => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onAdjustRent: (id: string, delta: number) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function LandlordScreen({
  properties,
  joinRequests,
  pendingCount,
  monthlyIncome,
  showForm,
  editing,
  form,
  onFormChange,
  onShowForm,
  onCloseForm,
  onSave,
  onEdit,
  onDelete,
  onAdjustRent,
  onApprove,
  onReject,
}: LandlordScreenProps) {
  const { theme } = useTheme();
  const pending = joinRequests.filter((r) => r.status === "pending");

  return (
    <>
      <ScreenShell
        title="Landlord Portal"
        subtitle="Manage properties & requests"
        headerRight={
          <Pressable
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={onShowForm}
          >
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        }
      >
        <View style={styles.stats}>
          <StatPill label="Properties" value={String(properties.length)} />
          <StatPill label="Pending" value={String(pendingCount)} />
          <StatPill label="Monthly" value={formatCurrency(monthlyIncome)} />
        </View>

        {pending.length > 0 && (
          <>
            <Text style={[styles.section, { color: theme.text }]}>Pending Requests</Text>
            {pending.map((req) => {
              const prop = properties.find((p) => p.id === req.property_id);
              return (
                <JoinRequestCard
                  key={req.id}
                  request={req}
                  propertyName={prop?.name ?? "Unknown"}
                  landlordView
                  onApprove={() => onApprove(req.id)}
                  onReject={() => onReject(req.id)}
                />
              );
            })}
          </>
        )}

        <Text style={[styles.section, { color: theme.text }]}>
          Your Properties ({properties.length})
        </Text>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            showControls
            showRules={false}
            onEdit={() => onEdit(property)}
            onDelete={() => onDelete(property.id)}
            onRentUp={() => onAdjustRent(property.id, 10)}
            onRentDown={() => onAdjustRent(property.id, -10)}
          />
        ))}
      </ScreenShell>

      <PropertyFormModal
        visible={showForm}
        editing={editing}
        form={form}
        onChange={onFormChange}
        onSave={onSave}
        onClose={onCloseForm}
      />
    </>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.pillValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.pillLabel, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  stats: { flexDirection: "row", gap: 10, marginBottom: 8 },
  pill: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
  },
  pillValue: { fontSize: 16, fontWeight: "800" },
  pillLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12, marginTop: 8 },
});
