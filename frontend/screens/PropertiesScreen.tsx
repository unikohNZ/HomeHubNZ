import { Pressable, StyleSheet, Text, View } from "react-native";
import { OfflineBanner } from "../components/OfflineBanner";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyFormModal } from "../components/PropertyFormModal";
import { ScreenShell } from "../components/ScreenShell";
import { EmptyState } from "../components/ui/EmptyState";
import { useTheme } from "../context/ThemeContext";
import { PropertyDataSource } from "../src/services/propertyService";
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
  propertiesOffline?: boolean;
  onRetryProperties?: () => void;
  onFormChange: (key: keyof PropertyFormData, value: string) => void;
  onShowForm: () => void;
  onCloseForm: () => void;
  onSave: () => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onAdjustRent: (id: string, delta: number) => void;
  onViewProperty?: (property: Property) => void;
  formImageUri?: string | null;
  onPickPropertyPhoto?: () => void;
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
  propertiesOffline = false,
  onRetryProperties,
  onFormChange,
  onShowForm,
  onCloseForm,
  onSave,
  onEdit,
  onDelete,
  onAdjustRent,
  onViewProperty,
  formImageUri,
  onPickPropertyPhoto,
}: PropertiesScreenProps) {
  const { theme } = useTheme();
  const isOffline =
    propertiesOffline || (propertiesSource === "mock" && !!propertiesError);
  const isConnected = propertiesSource === "api" && !propertiesError && !propertiesLoading;

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
        <OfflineBanner
          loading={propertiesLoading}
          saving={propertiesSaving}
          isOffline={isOffline}
          isConnected={isConnected}
          onRetry={onRetryProperties}
        />
        <Text style={[styles.section, { color: theme.text }]}>
          Your Properties ({properties.length})
        </Text>
        {propertiesLoading ? (
          <Text style={[styles.empty, { color: theme.textMuted }]}>Loading properties…</Text>
        ) : properties.length === 0 ? (
          <EmptyState
            icon="🏠"
            title="No properties yet"
            subtitle="Create your first rental listing to start managing tenants and rent."
            actionLabel="Create Property"
            onAction={onShowForm}
          />
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showControls
              showRules={false}
              onPress={() => onViewProperty?.(property)}
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
        imageUri={formImageUri}
        onPickPhoto={onPickPropertyPhoto}
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
