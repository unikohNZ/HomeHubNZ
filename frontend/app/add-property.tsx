import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton, AppInput, ScreenHeader } from "@/components";
import { useCreateProperty } from "@/hooks/useHomeHubData";
import { useToast } from "@/context/ToastContext";
import { colors, spacing } from "@/constants/theme";
import { PropertyType, RentFrequency } from "@/types";
import { titleCase } from "@/utils/format";

const TYPES: PropertyType[] = ["apartment", "townhouse", "house", "unit", "studio"];
const FREQUENCIES: RentFrequency[] = ["week", "fortnight", "month"];

export default function AddPropertyScreen() {
  const { mutateAsync, isPending } = useCreateProperty();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [city, setCity] = useState("Tauranga");
  const [postcode, setPostcode] = useState("");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("2");
  const [rent, setRent] = useState("");
  const [bond, setBond] = useState("");
  const [type, setType] = useState<PropertyType>("house");
  const [frequency, setFrequency] = useState<RentFrequency>("week");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !address.trim() || !rent) {
      setError("Property name, address and rent are required.");
      return;
    }
    setError(null);
    await mutateAsync({
      name: name.trim(),
      address_line1: address.trim(),
      suburb: suburb.trim() || "—",
      city: city.trim() || "Tauranga",
      postcode: postcode.trim() || "3110",
      property_type: type,
      bedrooms: parseInt(bedrooms, 10) || 1,
      bathrooms: parseInt(bathrooms, 10) || 1,
      rent_amount: parseFloat(rent) || 0,
      bond_amount: parseFloat(bond) || (parseFloat(rent) || 0) * 4,
      rent_frequency: frequency,
      tenant_count: 0,
      inspection_status: "due",
    });
    showToast("Property added");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Add Property" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppInput
            label="Property Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Papamoa Beach House"
            icon="home-outline"
          />
          <AppInput
            label="Street Address"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 45 Papamoa Beach Road"
            icon="location-outline"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppInput
                label="Suburb"
                value={suburb}
                onChangeText={setSuburb}
                placeholder="Papamoa"
              />
            </View>
            <View style={styles.flex}>
              <AppInput
                label="City"
                value={city}
                onChangeText={setCity}
                placeholder="Tauranga"
              />
            </View>
          </View>
          <AppInput
            label="Postcode"
            value={postcode}
            onChangeText={setPostcode}
            placeholder="3118"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Property Type</Text>
          <ChipRow
            options={TYPES}
            value={type}
            onChange={(v) => setType(v as PropertyType)}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <AppInput
                label="Bedrooms"
                value={bedrooms}
                onChangeText={setBedrooms}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex}>
              <AppInput
                label="Bathrooms"
                value={bathrooms}
                onChangeText={setBathrooms}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <AppInput
                label="Rent ($)"
                value={rent}
                onChangeText={setRent}
                placeholder="750"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex}>
              <AppInput
                label="Bond ($)"
                value={bond}
                onChangeText={setBond}
                placeholder="3000"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Rent Frequency</Text>
          <ChipRow
            options={FREQUENCIES}
            value={frequency}
            onChange={(v) => setFrequency(v as RentFrequency)}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.submit}>
            <AppButton
              title="Save Property"
              loading={isPending}
              onPress={submit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => (
        <Text
          key={opt}
          onPress={() => onChange(opt)}
          style={[styles.chip, value === opt && styles.chipActive]}
        >
          {titleCase(opt)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.sm,
  },
  row: { flexDirection: "row", gap: spacing.md },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    overflow: "hidden",
  },
  chipActive: {
    color: colors.primary,
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  error: { color: colors.dangerText, fontSize: 13, marginBottom: spacing.md },
  submit: { marginTop: spacing.md },
});
