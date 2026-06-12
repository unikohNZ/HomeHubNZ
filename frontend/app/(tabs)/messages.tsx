import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Avatar, LoadingSpinner } from "@/components";
import { useChatRooms } from "@/hooks/useHomeHubData";
import { colors, radius, spacing } from "@/constants/theme";
import { ChatRoom } from "@/types";
import { initials } from "@/utils/format";

export default function MessagesScreen() {
  const { data: rooms, isLoading } = useChatRooms();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Tenants, contractors and managers</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner fullScreen message="Loading conversations..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {(rooms ?? []).map((room) => (
            <ConversationRow key={room.id} room={room} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ConversationRow({ room }: { room: ChatRoom }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => router.push(`/chat/${room.id}`)}
    >
      <Avatar
        label={initials(room.name.split(" ")[0], room.name.split(" ")[1])}
        size={52}
        color={room.avatar_color}
        online={room.online}
      />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {room.name}
          </Text>
          <Text style={styles.time}>{room.last_time}</Text>
        </View>
        <Text style={styles.role}>{room.role}</Text>
        <Text
          style={[styles.preview, room.unread_count > 0 && styles.previewUnread]}
          numberOfLines={1}
        >
          {room.last_message}
        </Text>
      </View>
      {room.unread_count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{room.unread_count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  body: { flex: 1 },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { color: colors.text, fontSize: 15, fontWeight: "700", flex: 1 },
  time: { color: colors.textFaint, fontSize: 12 },
  role: { color: colors.textMuted, fontSize: 12, marginTop: 1 },
  preview: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  previewUnread: { color: colors.text, fontWeight: "600" },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.white, fontSize: 12, fontWeight: "700" },
});
