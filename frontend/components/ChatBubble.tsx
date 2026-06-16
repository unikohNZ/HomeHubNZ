import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ChatMessage } from "../types/message";
import { clockTime } from "../utils/format";
import { UserAvatar } from "./UserAvatar";

const CHAT_IMAGE_MAX_WIDTH = 220;

interface ChatBubbleProps {
  message: ChatMessage;
  avatarColor: string;
}

export function ChatBubble({ message, avatarColor }: ChatBubbleProps) {
  const { theme } = useTheme();
  const isImage = message.type === "image" && message.image_uri;

  if (message.is_mine) {
    return (
      <View style={[styles.row, styles.rowMine]}>
        <View
          style={[
            styles.bubble,
            styles.bubbleMine,
            isImage ? styles.bubbleImageMine : null,
            { backgroundColor: isImage ? "transparent" : theme.primary },
          ]}
        >
          {isImage ? (
            <Image
              source={{ uri: message.image_uri }}
              style={styles.chatImage}
              resizeMode="cover"
              accessibilityLabel="Sent image"
            />
          ) : (
            <Text style={styles.textMine}>{message.content}</Text>
          )}
          <Text style={[styles.timeMine, isImage && styles.timeMineOnImage]}>
            {clockTime(message.created_at)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <UserAvatar name={message.sender_name} color={avatarColor} size={32} />
      <View
        style={[
          styles.bubble,
          isImage ? styles.bubbleImage : null,
          { backgroundColor: isImage ? "transparent" : theme.card, borderColor: theme.border },
        ]}
      >
        {isImage ? (
          <Image
            source={{ uri: message.image_uri }}
            style={styles.chatImage}
            resizeMode="cover"
            accessibilityLabel={`Image from ${message.sender_name}`}
          />
        ) : (
          <Text style={[styles.text, { color: theme.text }]}>{message.content}</Text>
        )}
        <Text style={[styles.time, { color: theme.textMuted }, isImage && styles.timeOnImage]}>
          {clockTime(message.created_at)}
        </Text>
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
  bubbleImage: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    overflow: "hidden",
  },
  bubbleMine: { borderBottomRightRadius: 4, borderBottomLeftRadius: 20, borderWidth: 0 },
  bubbleImageMine: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    alignItems: "flex-end",
  },
  chatImage: {
    width: CHAT_IMAGE_MAX_WIDTH,
    maxWidth: CHAT_IMAGE_MAX_WIDTH,
    height: 160,
    borderRadius: 16,
  },
  text: { fontSize: 15, lineHeight: 20 },
  textMine: { color: "#fff", fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4 },
  timeMine: { color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 4, textAlign: "right" },
  timeMineOnImage: { color: "rgba(4, 20, 45, 0.55)", marginTop: 6, paddingRight: 2 },
  timeOnImage: { marginTop: 6, paddingLeft: 2 },
});
