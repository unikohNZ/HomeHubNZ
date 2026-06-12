import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge, EmptyState, LoadingSpinner } from "@/components";
import { useProperties } from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import { formatCurrency, inspectionTone, titleCase } from "@/utils/format";
import { Property } from "@/types";

export default function PropertiesScreen() {
  const { data: properties, isLoading } = useProperties();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Properties</Text>
          <Text style={styles.subtitle}>
            {properties?.length ?? 0} active in your portfolio
          </Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/add-property")}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading properties..." />
      ) : !properties || properties.length === 0 ? (
        <EmptyState
          icon="home-outline"
          title="No properties yet"
          message="Add your first property to start tracking rent, maintenance and tenants."
          actionLabel="Add Property"
          onAction={() => router.push("/add-property")}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const tone = inspectionTone(property.inspection_status);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/property/${property.id}`)}
    >
      <Image source={{ uri: property.image_url }} style={styles.image} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName} numberOfLines={1}>
            {property.name}
          </Text>
          <Text style={styles.rent}>
            {formatCurrency(property.rent_amount)}
            <Text style={styles.rentFreq}>/{property.rent_frequency}</Text>
          </Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          {property.suburb}, {property.city}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="bed-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="water-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{property.tenant_count} tenants</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Badge
            label={titleCase(property.inspection_status)}
            bg={tone.bg}
            text={tone.text}
            size="sm"
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  image: { width: "100%", height: 150, backgroundColor: colors.surfaceElevated },
  cardBody: { padding: spacing.lg },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: { color: colors.text, fontSize: 17, fontWeight: "700", flex: 1 },
  rent: { color: colors.successText, fontSize: 16, fontWeight: "800" },
  rentFreq: { color: colors.textMuted, fontSize: 12, fontWeight: "500" },
  address: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: colors.textSecondary, fontSize: 13, fontWeight: "500" },
});
