import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ChatMessage } from "../types/message";
import { clockTime } from "../utils/format";
import { UserAvatar } from "./UserAvatar";

interface ChatBubbleProps {
  message: ChatMessage;
  avatarColor: string;
}

export function ChatBubble({ message, avatarColor }: ChatBubbleProps) {
  const { theme } = useTheme();

  if (message.is_mine) {
    return (
      <View style={[styles.row, styles.rowMine]}>
        <View style={[styles.bubble, styles.bubbleMine, { backgroundColor: theme.primary }]}>
          <Text style={styles.textMine}>{message.content}</Text>
          <Text style={styles.timeMine}>{clockTime(message.created_at)}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <UserAvatar name={message.sender_name} color={avatarColor} size={32} />
      <View style={[styles.bubble, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.text, { color: theme.text }]}>{message.content}</Text>
        <Text style={[styles.time, { color: theme.textMuted }]}>{clockTime(message.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "85%",
    marginBottom: 10,
  },
  rowMine: { alignSelf: "flex-end" },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: { borderBottomRightRadius: 4, borderBottomLeftRadius: 20, borderWidth: 0 },
  text: { fontSize: 15, lineHeight: 20 },
  textMine: { color: "#fff", fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4 },
  timeMine: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 4, textAlign: "right" },
});
