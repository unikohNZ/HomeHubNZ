import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Conversation } from "../types/message";
import { UserAvatar } from "./UserAvatar";

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <UserAvatar
        name={conversation.name}
        color={conversation.avatar_color}
        size={52}
        online={conversation.online}
      />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={[styles.time, { color: theme.textMuted }]}>{conversation.last_time}</Text>
        </View>
        <Text style={[styles.role, { color: theme.textMuted }]}>{conversation.role}</Text>
        <Text
          style={[
            styles.preview,
            { color: conversation.unread_count ? theme.text : theme.textMuted },
            conversation.unread_count > 0 && styles.unread,
          ]}
          numberOfLines={1}
        >
          {conversation.typing ? "typing..." : conversation.last_message}
        </Text>
      </View>
      {conversation.unread_count > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={styles.badgeText}>{conversation.unread_count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  pressed: { opacity: 0.9 },
  body: { flex: 1 },
  top: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "700", flex: 1 },
  time: { fontSize: 11 },
  role: { fontSize: 12, marginTop: 1 },
  preview: { fontSize: 13, marginTop: 4 },
  unread: { fontWeight: "700" },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
