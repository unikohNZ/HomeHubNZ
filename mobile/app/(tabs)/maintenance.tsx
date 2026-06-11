import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { AppCard, LoadingSpinner, PrimaryButton, ScreenHeader, StatusBadge } from "@/components";
import { useMaintenance } from "@/hooks/useMockData";
import { MOCK_PROPERTIES } from "@/data/mockData";
import { MaintenanceRequest } from "@/types";

const PRIORITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  low: "arrow-down-circle",
  medium: "remove-circle",
  high: "arrow-up-circle",
  urgent: "warning",
};

export default function MaintenanceScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useMaintenance();

  const getPropertyAddress = (propertyId: number) => {
    const property = MOCK_PROPERTIES.find((p) => p.id === propertyId);
    return property ? `${property.suburb}, ${property.city}` : "Unknown property";
  };

  const renderRequest = ({ item }: { item: MaintenanceRequest }) => (
    <AppCard className="mb-3" elevated>
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-start flex-1 mr-2">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: colors.warning + "22" }}
          >
            <Ionicons
              name={PRIORITY_ICONS[item.priority] || "construct"}
              size={20}
              color={colors.warning}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {item.title}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {getPropertyAddress(item.property_id)}
            </Text>
          </View>
        </View>
        <StatusBadge status={item.priority} />
      </View>

      <Text className="text-sm leading-5 mb-3" style={{ color: colors.textSecondary }} numberOfLines={2}>
        {item.description}
      </Text>

      <View className="flex-row items-center justify-between pt-3 border-t" style={{ borderTopColor: colors.border }}>
        <StatusBadge status={item.status} />
        {item.category && (
          <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            {item.category}
          </Text>
        )}
      </View>
    </AppCard>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5">
        <ScreenHeader
          title="Maintenance"
          subtitle="Track repairs and requests"
          right={<PrimaryButton title="New" size="sm" onPress={() => {}} />}
        />
      </View>

      {isLoading ? (
        <LoadingSpinner message="Loading requests..." />
      ) : (
        <FlatList
          data={data}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="px-5 pb-8"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="construct-outline" size={56} color={colors.textSecondary} />
              <Text className="text-base mt-4 font-medium" style={{ color: colors.textSecondary }}>
                No maintenance requests
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
