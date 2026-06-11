import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { chatApi } from "@/services/api";
import { ChatRoom } from "@/types";
import { Card } from "@/components/ui/Card";

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: () => chatApi.rooms().then((r) => r.data as ChatRoom[]),
  });

  const renderRoom = ({ item }: { item: ChatRoom }) => (
    <Card className="mb-2 flex-row items-center">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: colors.primaryLight }}
      >
        <Ionicons
          name={item.room_type === "property" ? "home" : item.room_type === "maintenance" ? "construct" : "person"}
          size={22}
          color={colors.primary}
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {item.name || `${item.room_type} chat`}
        </Text>
        {item.last_message && (
          <Text className="text-sm mt-0.5" numberOfLines={1} style={{ color: colors.textSecondary }}>
            {item.last_message.content}
          </Text>
        )}
      </View>
      {item.unread_count > 0 && (
        <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
          <Text className="text-xs font-bold text-white">{item.unread_count}</Text>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-bold px-5 pt-4 pb-4" style={{ color: colors.text }}>Messages</Text>
      <FlatList
        data={data || []}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-6"
        ListEmptyComponent={
          <View className="items-center py-20">
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
            <Text className="text-base mt-4" style={{ color: colors.textSecondary }}>
              {isLoading ? "Loading..." : "No conversations yet"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
