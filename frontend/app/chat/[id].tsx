import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, LoadingSpinner, ScreenHeader } from "@/components";
import { useChatMessages, useChatRooms } from "@/hooks/useHomeHubData";
import { messageService } from "@/services/messageService";
import { colors, radius, spacing } from "@/constants/theme";
import { ChatMessage } from "@/types";
import { initials } from "@/utils/format";

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = Number(id);
  const { data: rooms } = useChatRooms();
  const { data: initial, isLoading } = useChatMessages(roomId);

  const room = rooms?.find((r) => r.id === roomId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (initial) setMessages(initial);
  }, [initial]);

  const send = async () => {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    const optimistic = await messageService.send(roomId, content);
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={room?.name ?? "Conversation"}
        subtitle={room?.online ? "Online" : room?.role}
        rightIcon="call-outline"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {isLoading ? (
          <LoadingSpinner fullScreen message="Loading messages..." />
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: false })
            }
          >
            {room?.property_name && (
              <View style={styles.contextPill}>
                <Ionicons name="home" size={13} color={colors.textMuted} />
                <Text style={styles.contextText}>{room.property_name}</Text>
              </View>
            )}
            {messages.map((message) => (
              <Bubble
                key={message.id}
                message={message}
                avatarColor={room?.avatar_color ?? colors.primary}
                senderInitials={initials(
                  (room?.name ?? "U").split(" ")[0],
                  (room?.name ?? "").split(" ")[1],
                )}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <Pressable style={styles.attach}>
            <Ionicons name="add" size={24} color={colors.textMuted} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.textFaint}
            multiline
            onSubmitEditing={send}
          />
          <Pressable
            style={[styles.send, !draft.trim() && styles.sendDisabled]}
            onPress={send}
            disabled={!draft.trim()}
          >
            <Ionicons name="arrow-up" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({
  message,
  avatarColor,
  senderInitials,
}: {
  message: ChatMessage;
  avatarColor: string;
  senderInitials: string;
}) {
  if (message.is_mine) {
    return (
      <View style={[styles.bubbleRow, styles.bubbleRowMine]}>
        <View style={[styles.bubble, styles.bubbleMine]}>
          <Text style={styles.bubbleTextMine}>{message.content}</Text>
          <Text style={styles.timeMine}>{clockTime(message.created_at)}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.bubbleRow}>
      <Avatar label={senderInitials} size={32} color={avatarColor} />
      <View style={[styles.bubble, styles.bubbleTheirs]}>
        <Text style={styles.bubbleText}>{message.content}</Text>
        <Text style={styles.time}>{clockTime(message.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  messages: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  contextPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginVertical: spacing.md,
  },
  contextText: { color: colors.textMuted, fontSize: 12 },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    maxWidth: "85%",
  },
  bubbleRowMine: { alignSelf: "flex-end" },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { color: colors.text, fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: colors.white, fontSize: 15, lineHeight: 20 },
  time: { color: colors.textFaint, fontSize: 10, marginTop: 4 },
  timeMine: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  attach: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    color: colors.text,
    fontSize: 15,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.4 },
});
