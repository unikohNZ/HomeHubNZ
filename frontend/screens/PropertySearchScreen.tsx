import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { OfflineBanner } from "../components/OfflineBanner";
import { PropertyCard } from "../components/PropertyCard";
import { ScreenShell } from "../components/ScreenShell";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../constants/design";
import { usePropertySearch } from "../src/hooks/useProperties";
import { formatLocationLabel, useUserLocation } from "../src/hooks/useUserLocation";
import { RADIUS_OPTIONS_KM } from "../src/services/locationService";
import { Property } from "../types/property";

interface PropertySearchScreenProps {
  allProperties: Property[];
  isOffline?: boolean;
  onBack: () => void;
  onSelectProperty?: (property: Property) => void;
  onRequestJoin?: (propertyId: string) => void;
}

export function PropertySearchScreen({
  allProperties,
  isOffline = false,
  onBack,
  onSelectProperty,
  onRequestJoin,
}: PropertySearchScreenProps) {
  const { theme } = useTheme();
  const { location } = useUserLocation();
  const locationLabel = formatLocationLabel(location);
  const [city, setCity] = useState(locationLabel?.split(",")[0] ?? "");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [availableRooms, setAvailableRooms] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const filters = useMemo(
    () => ({
      location: locationLabel ?? (city.trim() || undefined),
      lat: location?.preferred_latitude ?? undefined,
      lng: location?.preferred_longitude ?? undefined,
      radius_km: location?.preferred_latitude ? radiusKm : undefined,
      city: city.trim() || undefined,
      min_rent: minRent ? parseFloat(minRent) : undefined,
      max_rent: maxRent ? parseFloat(maxRent) : undefined,
      min_rooms: availableRooms ? parseInt(availableRooms, 10) : undefined,
      min_bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
    }),
    [city, locationLabel, location, radiusKm, minRent, maxRent, availableRooms, bedrooms],
  );

  const searchQuery = usePropertySearch(filters);
  const results = searchQuery.data?.data ?? allProperties;
  const showOffline = isOffline || searchQuery.data?.source === "mock";

  return (
    <ScreenShell
      headerContent={
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button">
            <Text style={[styles.backText, { color: theme.primary }]}>← Back</Text>
          </Pressable>
          <View style={styles.flex}>
            <Text style={[styles.title, { color: theme.text }]}>Search Properties</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Find flats across New Zealand
            </Text>
          </View>
        </View>
      }
    >
      <OfflineBanner
        loading={searchQuery.isLoading}
        isOffline={showOffline && !searchQuery.isLoading}
        onRetry={() => searchQuery.refetch()}
      />

      <View style={styles.filters}>
        <FilterField
          label="Location"
          value={locationLabel ?? city}
          onChangeText={setCity}
          placeholder="e.g. Mount Maunganui"
        />
        {location?.preferred_latitude != null && (
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS_KM.map((km) => (
              <Pressable
                key={km}
                style={[
                  styles.radiusChip,
                  {
                    backgroundColor: radiusKm === km ? theme.primary : theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setRadiusKm(km)}
              >
                <Text style={{ color: radiusKm === km ? "#fff" : theme.text, fontWeight: "700", fontSize: 12 }}>
                  {km} km
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.row}>
          <FilterField
            label="Min rent / wk"
            value={minRent}
            onChangeText={setMinRent}
            placeholder="400"
            keyboardType="numeric"
            flex
          />
          <FilterField
            label="Max rent / wk"
            value={maxRent}
            onChangeText={setMaxRent}
            placeholder="900"
            keyboardType="numeric"
            flex
          />
        </View>
        <View style={styles.row}>
          <FilterField
            label="Available rooms"
            value={availableRooms}
            onChangeText={setAvailableRooms}
            placeholder="1"
            keyboardType="numeric"
            flex
          />
          <FilterField
            label="Bedrooms"
            value={bedrooms}
            onChangeText={setBedrooms}
            placeholder="2"
            keyboardType="numeric"
            flex
          />
        </View>
      </View>

      <SectionHeader title={`Results (${results.length})`} />

      {searchQuery.isLoading ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>Searching…</Text>
      ) : results.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No properties match"
          subtitle="Try widening your filters or search a nearby city."
        />
      ) : (
        results.map((property) => (
          <View key={property.id} style={styles.cardWrap}>
            <PropertyCard
              property={property}
              showRules={false}
              showControls={false}
              onPress={() => onSelectProperty?.(property)}
            />
            <View style={styles.metaRow}>
              <Text style={[styles.meta, { color: theme.textSecondary }]}>
                {property.available_rooms} room{property.available_rooms === 1 ? "" : "s"} ·{" "}
                {property.flatmate_count}/{property.max_flatmates} occupied
              </Text>
              {onRequestJoin && (
                <Pressable
                  style={[styles.joinBtn, { backgroundColor: theme.primary }]}
                  onPress={() => onRequestJoin(property.id)}
                >
                  <Text style={styles.joinText}>Request to Join</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}
    </ScreenShell>
  );
}

function FilterField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  flex,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  flex?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.field, flex && styles.flex]}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  backBtn: { paddingTop: 4 },
  backText: { fontSize: 15, fontWeight: "700" },
  flex: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4 },
  filters: { gap: spacing.md, marginBottom: spacing.lg },
  row: { flexDirection: "row", gap: spacing.md },
  field: { gap: spacing.xs, flex: 1 },
  label: { fontSize: 12, fontWeight: "700" },
  input: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  hint: { fontSize: 14, marginBottom: spacing.md },
  cardWrap: { marginBottom: spacing.md },
  radiusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  radiusChip: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  meta: { fontSize: 13, fontWeight: "600", flex: 1 },
  joinBtn: { borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  joinText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
