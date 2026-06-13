import { Pressable, StyleSheet, Text, View } from "react-native";
import { PropertyApiBanner } from "../components/PropertyApiBanner";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyFormModal } from "../components/PropertyFormModal";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { PropertyDataSource } from "../src/services/propertyApi";
import { Property, PropertyFormData } from "../types/property";

interface PropertiesScreenProps {
  properties: Property[];
  showForm: boolean;
  editing: boolean;
  form: PropertyFormData;
  propertiesLoading?: boolean;
  propertiesSaving?: boolean;
  propertiesError?: string | null;
  propertiesSource?: PropertyDataSource;
  onRetryProperties?: () => void;
  onFormChange: (key: keyof PropertyFormData, value: string) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSave: () => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onAdjustRent: (id: string, delta: number) => void;
}

export function PropertiesScreen({
  properties,
  showForm,
  editing,
  form,
  propertiesLoading,
  propertiesSaving,
  propertiesError,
  propertiesSource = "mock",
  onRetryProperties,
  onFormChange,
  onShowForm,
  onCloseForm,
  onSave,
  onEdit,
  onDelete,
  onAdjustRent,
}: PropertiesScreenProps) {
  const { theme } = useTheme();

  return (
    <>
      <ScreenShell
        title="Properties"
        subtitle="Create, edit & manage rentals"
        headerRight={
          <Pressable
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={onShowForm}
            disabled={propertiesLoading || propertiesSaving}
          >
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        }
      >
        <PropertyApiBanner
          loading={propertiesLoading}
          saving={propertiesSaving}
          error={propertiesError}
          source={propertiesSource}
          onRetry={onRetryProperties}
        />
        <Text style={[styles.section, { color: theme.text }]}>
          Your Properties ({properties.length})
        </Text>
        {propertiesLoading ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>Loading properties…</Text>
        ) : properties.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>
            No properties yet. Tap + Add to create one.
          </Text>
        ) : (
          properties.map((property) => (
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
          ))
        )}
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

const styles = StyleSheet.create({
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  empty: { fontSize: 14, marginBottom: 16 },
});
