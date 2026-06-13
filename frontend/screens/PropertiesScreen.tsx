import { Pressable, StyleSheet, Text, View } from "react-native";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyFormModal } from "../components/PropertyFormModal";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { Property, PropertyFormData } from "../types/property";

interface PropertiesScreenProps {
  properties: Property[];
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
}

export function PropertiesScreen({
  properties,
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
          >
            <Text style={styles.addText}>+ Add</Text>
          </Pressable>
        }
      >
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

const styles = StyleSheet.create({
  addBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  section: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
});
