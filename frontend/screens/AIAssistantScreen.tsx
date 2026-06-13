import { useRef, useState } from "react";
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
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { AIQuickQuestion } from "../types/flat";

interface AIMessage {
  id: string;
  content: string;
  is_user: boolean;
}

interface AIAssistantScreenProps {
  quickQuestions: AIQuickQuestion[];
  onBack: () => void;
}

export function AIAssistantScreen({ quickQuestions, onBack }: AIAssistantScreenProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      content:
        "Kia ora! I'm your HomeHub flat assistant. Ask me about rent, bills, chores, or maintenance.",
      is_user: false,
    },
  ]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const ask = (question: string, answer: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, content: question, is_user: true },
      { id: `a-${Date.now()}`, content: answer, is_user: false },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const match = quickQuestions.find((q) =>
      text.toLowerCase().includes(q.question.toLowerCase().slice(0, 12)),
    );
    const answer = match
      ? match.answer
      : "I can help with rent, bills, chores, lease dates, and maintenance. Try a quick question below!";
    ask(text, answer);
    setDraft("");
  };

  return (
    <SubScreenLayout title="AI Assistant" subtitle="Mock flat helper" onBack={onBack}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chat}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.bubble,
                m.is_user ? styles.bubbleMine : styles.bubbleBot,
                {
                  backgroundColor: m.is_user ? theme.primary : theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: m.is_user ? "#fff" : theme.text, fontSize: 14, lineHeight: 20 }}>
                {m.content}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={[styles.quickTitle, { color: theme.textSecondary }]}>Quick questions</Text>
        <View style={styles.quickGrid}>
          {quickQuestions.map((q) => (
            <Pressable
              key={q.id}
              style={[styles.quickBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => ask(q.question, q.answer)}
            >
              <Text style={[styles.quickText, { color: theme.text }]} numberOfLines={2}>
                {q.question}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            placeholder="Ask the assistant..."
            placeholderTextColor={theme.textMuted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={handleSend}
          />
          <Pressable style={[styles.send, { backgroundColor: theme.primary }]} onPress={handleSend}>
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  chat: { flex: 1, minHeight: 400 },
  messages: { maxHeight: 280 },
  messagesContent: { gap: 10, paddingBottom: 8 },
  bubble: { borderRadius: 18, padding: 14, maxWidth: "90%", borderWidth: 1 },
  bubbleMine: { alignSelf: "flex-end", borderWidth: 0 },
  bubbleBot: { alignSelf: "flex-start" },
  quickTitle: { fontSize: 12, fontWeight: "700", marginTop: 12, marginBottom: 8 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  quickBtn: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 12 },
  quickText: { fontSize: 12, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: 10, paddingTop: 8, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sendText: { color: "#fff", fontSize: 20, fontWeight: "700" },
});
