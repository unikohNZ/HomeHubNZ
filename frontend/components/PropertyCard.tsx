import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Property } from "../types/property";
import { formatCurrency } from "../utils/format";
import { Card } from "./Card";

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRentUp?: () => void;
  onRentDown?: () => void;
  showControls?: boolean;
  showRules?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionNote?: string;
}

export function PropertyCard({
  property,
  onPress,
  onEdit,
  onDelete,
  onRentUp,
  onRentDown,
  showControls,
  showRules = true,
  actionLabel,
  onAction,
  actionDisabled,
  actionNote,
}: PropertyCardProps) {
  const { theme } = useTheme();

  return (
    <Card onPress={onPress}>
      <Image source={{ uri: property.image_url }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.flex}>
            <Text style={[styles.name, { color: theme.text }]}>{property.name}</Text>
            <Text style={[styles.address, { color: theme.textMuted }]}>
              📍{" "}
              {property.distance_km != null
                ? `${property.distance_km} km away`
                : `${property.suburb}, ${property.city}`}
            </Text>
          </View>
          <Text style={[styles.rent, { color: theme.success }]}>
            {formatCurrency(property.weekly_rent)}/wk
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MetaChip label={`Bond ${formatCurrency(property.bond)}`} />
          <MetaChip label={`${property.bedrooms} bed`} />
          <MetaChip label={`${property.bathrooms} bath`} />
          <MetaChip
            label={`${property.flatmate_count}/${property.max_flatmates} flatmates`}
          />
        </View>

        {showControls && (
          <>
            <Text style={[styles.monthly, { color: theme.textSecondary }]}>
              ~{formatCurrency(property.weekly_rent * 4)}/month estimated
            </Text>
            <View style={styles.rentRow}>
              <Pressable
                style={[styles.rentBtn, { backgroundColor: theme.primaryMuted }]}
                onPress={onRentDown}
              >
                <Text style={[styles.rentBtnText, { color: theme.primary }]}>−$10</Text>
              </Pressable>
              <Text style={[styles.rentCurrent, { color: theme.text }]}>
                {formatCurrency(property.weekly_rent)}
              </Text>
              <Pressable
                style={[styles.rentBtn, { backgroundColor: theme.primaryMuted }]}
                onPress={onRentUp}
              >
                <Text style={[styles.rentBtnText, { color: theme.primary }]}>+$10</Text>
              </Pressable>
            </View>
            <View style={styles.actions}>
              <Pressable
                style={[styles.editBtn, { backgroundColor: theme.primaryMuted }]}
                onPress={onEdit}
              >
                <Text style={[styles.editText, { color: theme.primary }]}>Edit</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteBtn, { backgroundColor: theme.dangerMuted, borderColor: theme.danger }]}
                onPress={onDelete}
              >
                <Text style={[styles.deleteText, { color: theme.danger }]}>Delete</Text>
              </Pressable>
            </View>
          </>
        )}

        {showRules && (
          <View style={styles.rules}>
            <Text style={[styles.rulesTitle, { color: theme.textSecondary }]}>
              Rules & Conditions
            </Text>
            {property.rules.map((rule) => (
              <Text key={rule} style={[styles.rule, { color: theme.textMuted }]}>
                • {rule}
              </Text>
            ))}
          </View>
        )}

        {actionNote && (
          <View style={[styles.note, { backgroundColor: theme.warningMuted }]}>
            <Text style={[styles.noteText, { color: theme.warning }]}>{actionNote}</Text>
          </View>
        )}

        {actionLabel && onAction && !actionDisabled && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={onAction}
          >
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

function MetaChip({ label }: { label: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: theme.primaryMuted }]}>
      <Text style={[styles.chipText, { color: theme.primary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: 140, borderRadius: 16, marginBottom: 14, backgroundColor: "#1e293b" },
  body: {},
  topRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  name: { fontSize: 17, fontWeight: "800" },
  address: { fontSize: 13, marginTop: 4 },
  rent: { fontSize: 16, fontWeight: "800" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: "600" },
  monthly: { fontSize: 13, marginTop: 12 },
  rentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  rentBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  rentBtnText: { fontSize: 13, fontWeight: "700" },
  rentCurrent: { fontSize: 16, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  editBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  editText: { fontSize: 14, fontWeight: "700" },
  deleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 1 },
  deleteText: { fontSize: 14, fontWeight: "700" },
  rules: { marginTop: 14 },
  rulesTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  rule: { fontSize: 13, lineHeight: 20 },
  note: { borderRadius: 12, padding: 12, marginTop: 12, alignItems: "center" },
  noteText: { fontSize: 14, fontWeight: "700" },
  actionBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
