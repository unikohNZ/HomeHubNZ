import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ConversationRow } from "../components/ConversationRow";
import { ScreenShell } from "../components/ScreenShell";
import { useTheme } from "../context/ThemeContext";
import { Conversation, MessageCategory } from "../types/message";

interface MessagesScreenProps {
  conversations: Conversation[];
  onOpenChat: (id: string) => void;
  isTab?: boolean;
}

const CATEGORIES: { id: MessageCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "landlord", label: "Landlord" },
  { id: "flatmate", label: "Flatmate" },
  { id: "contractor", label: "Contractor" },
];

export function MessagesScreen({
  conversations,
  onOpenChat,
  isTab = false,
}: MessagesScreenProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<MessageCategory | "all">("all");

  const filtered =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.category === filter);

  const content = (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
      >
        {CATEGORIES.map((cat) => {
          const active = filter === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? theme.primaryMuted : theme.card,
                  borderColor: active ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setFilter(cat.id)}
            >
              <Text
                style={{
                  color: active ? theme.primary : theme.textSecondary,
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No conversations in this category
          </Text>
        </View>
      ) : (
        filtered.map((c) => (
          <ConversationRow key={c.id} conversation={c} onPress={() => onOpenChat(c.id)} />
        ))
      )}
    </>
  );

  if (isTab) {
    return (
      <ScreenShell title="Messages" subtitle="Landlord, flatmates & contractors">
        {content}
      </ScreenShell>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
      </View>
      <View style={styles.list}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800" },
  list: { flex: 1 },
  filterScroll: { marginBottom: 14, maxHeight: 44 },
  filters: { gap: 8, paddingRight: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  empty: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 14 },
});
