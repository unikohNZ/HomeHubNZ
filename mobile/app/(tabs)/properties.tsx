import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { propertiesApi } from "@/services/api";
import { Property } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PropertiesScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => propertiesApi.list().then((r) => r.data as Property[]),
  });

  const renderProperty = ({ item }: { item: Property }) => (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {item.address_line1}
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {item.suburb}, {item.city} {item.postcode}
          </Text>
        </View>
        <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
          <Text className="text-xs font-medium capitalize" style={{ color: colors.primary }}>
            {item.property_type}
          </Text>
        </View>
      </View>
      <View className="flex-row mt-4 gap-4">
        <View className="flex-row items-center">
          <Ionicons name="bed" size={16} color={colors.textSecondary} />
          <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>{item.bedrooms} bed</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="water" size={16} color={colors.textSecondary} />
          <Text className="text-sm ml-1" style={{ color: colors.textSecondary }}>{item.bathrooms} bath</Text>
        </View>
        <Text className="text-sm font-semibold ml-auto" style={{ color: colors.primary }}>
          ${item.rent_amount}/{item.rent_frequency}
        </Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Properties</Text>
        <Button title="Add" size="sm" onPress={() => {}} />
      </View>
      <FlatList
        data={data || []}
        renderItem={renderProperty}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-6"
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="home-outline" size={48} color={colors.textSecondary} />
            <Text className="text-base mt-4" style={{ color: colors.textSecondary }}>
              {isLoading ? "Loading..." : "No properties yet"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
