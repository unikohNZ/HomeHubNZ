import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

const MOCK_REQUESTS = [
  { id: 1, title: "Leaking kitchen tap", priority: "medium", status: "submitted", date: "2026-06-10" },
  { id: 2, title: "Broken light switch", priority: "low", status: "assigned", date: "2026-06-08" },
  { id: 3, title: "Heating not working", priority: "high", status: "in_progress", date: "2026-06-05" },
];

export default function MaintenanceScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Maintenance</Text>
        <Button title="New Request" size="sm" onPress={() => {}} />
      </View>
      <FlatList
        data={MOCK_REQUESTS}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-6"
        renderItem={({ item }) => (
          <Card className="mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-base font-semibold flex-1 mr-2" style={{ color: colors.text }}>
                {item.title}
              </Text>
              <StatusBadge status={item.priority} />
            </View>
            <View className="flex-row items-center justify-between">
              <StatusBadge status={item.status} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{item.date}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
            <Text className="text-base mt-4" style={{ color: colors.textSecondary }}>No maintenance requests</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
