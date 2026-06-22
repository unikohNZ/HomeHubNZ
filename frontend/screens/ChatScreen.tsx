import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChatBubble } from "../components/ChatBubble";
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../context/ThemeContext";
import { pickMessageImage } from "../utils/imagePicker";
import { ChatMessage, Conversation } from "../types/message";

interface ChatScreenProps {
  conversation: Conversation;
  messages: ChatMessage[];
  onBack: () => void;
  onSend: (content: string) => void;
  onSendImage: (imageUri: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function ChatScreen({
  conversation,
  messages,
  onBack,
  onSend,
  onSendImage,
  onTypingStart,
  onTypingStop,
}: ChatScreenProps) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (conversation.typing) {
      setTyping(true);
      const t = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(t);
    }
  }, [conversation.typing]);

  const scrollToEnd = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleDraftChange = (text: string) => {
    setDraft(text);
    if (text.trim()) {
      onTypingStart?.();
    } else {
      onTypingStop?.();
    }
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onTypingStop?.();
    onSend(text);
    setDraft("");
    scrollToEnd();
  };

  const handleAttachImage = async () => {
    if (pickingImage) return;

    setPickingImage(true);
    try {
      const uri = await pickMessageImage();
      if (uri) {
        onSendImage(uri);
        scrollToEnd();
      }
    } finally {
      setPickingImage(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={onBack} style={styles.back}>
          <Text style={[styles.backText, { color: theme.primary }]}>←</Text>
        </Pressable>
        <UserAvatar
          name={conversation.name}
          color={conversation.avatar_color}
          size={40}
          online={conversation.online}
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: theme.text }]}>{conversation.name}</Text>
          <Text style={[styles.status, { color: theme.textMuted }]}>
            {conversation.online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            avatarColor={conversation.avatar_color}
          />
        ))}
        {typing && (
          <View style={styles.typingRow}>
            <View style={[styles.typingBubble, { backgroundColor: theme.card }]}>
              <Text style={[styles.typingText, { color: theme.textMuted }]}>typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputRow, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <Pressable
          style={({ pressed }) => [
            styles.attachBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
            pressed && styles.attachPressed,
          ]}
          onPress={handleAttachImage}
          disabled={pickingImage}
          accessibilityRole="button"
          accessibilityLabel="Attach image"
        >
          {pickingImage ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Text style={styles.attachIcon}>🖼️</Text>
          )}
        </Pressable>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.card, borderColor: theme.border, color: theme.text },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          value={draft}
          onChangeText={handleDraftChange}
          onBlur={() => onTypingStop?.()}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable
          style={[styles.send, { backgroundColor: theme.primary }]}
          onPress={handleSend}
        >
          <Text style={styles.sendText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  back: { padding: 4 },
  backText: { fontSize: 22, fontWeight: "600" },
  headerInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700" },
  status: { fontSize: 12, marginTop: 2 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  typingRow: { marginTop: 4 },
  typingBubble: { alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  typingText: { fontSize: 13, fontStyle: "italic" },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  attachPressed: { opacity: 0.85 },
  attachIcon: { fontSize: 20 },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "700" },
});
