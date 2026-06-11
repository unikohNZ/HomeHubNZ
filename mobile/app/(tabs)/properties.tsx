import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { AppCard, LoadingSpinner, PrimaryButton, ScreenHeader } from "@/components";
import { useProperties } from "@/hooks/useMockData";
import { Property } from "@/types";

export default function PropertiesScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useProperties();

  const renderProperty = ({ item }: { item: Property }) => (
    <AppCard className="mb-3" elevated>
      <View className="flex-row items-start justify-between mb-3">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: colors.primaryMuted }}
        >
          <Ionicons name="home" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold" style={{ color: colors.text }}>
            {item.address_line1}
          </Text>
          <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
            {item.suburb}, {item.city} {item.postcode}
          </Text>
        </View>
        <View className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: colors.primaryMuted }}>
          <Text className="text-xs font-semibold capitalize" style={{ color: colors.primary }}>
            {item.property_type}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text className="text-sm mb-3 leading-5" style={{ color: colors.textSecondary }} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View className="flex-row items-center pt-3 border-t" style={{ borderTopColor: colors.border }}>
        <View className="flex-row items-center mr-4">
          <Ionicons name="bed-outline" size={16} color={colors.textSecondary} />
          <Text className="text-sm ml-1.5" style={{ color: colors.textSecondary }}>
            {item.bedrooms} bed
          </Text>
        </View>
        <View className="flex-row items-center mr-4">
          <Ionicons name="water-outline" size={16} color={colors.textSecondary} />
          <Text className="text-sm ml-1.5" style={{ color: colors.textSecondary }}>
            {item.bathrooms} bath
          </Text>
        </View>
        <Text className="text-sm font-bold ml-auto" style={{ color: colors.accent }}>
          ${item.rent_amount}/{item.rent_frequency}
        </Text>
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5">
        <ScreenHeader
          title="Properties"
          subtitle="Manage your New Zealand portfolio"
          right={<PrimaryButton title="Add" size="sm" onPress={() => {}} />}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading properties..." />
      ) : (
        <FlatList
          data={data}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-5 pb-8"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="home-outline" size={56} color={colors.textSecondary} />
              <Text className="text-base mt-4 font-medium" style={{ color: colors.textSecondary }}>
                No properties yet
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
