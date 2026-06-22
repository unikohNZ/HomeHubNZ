import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ConversationRow } from "../components/ConversationRow";
import { ScreenShell } from "../components/ScreenShell";
import { EmptyState } from "../components/ui/EmptyState";
import { SegmentTabs } from "../components/ui/SegmentTabs";
import { useTheme } from "../context/ThemeContext";
import { Conversation, MessageCategory } from "../types/message";
import { radius, spacing } from "../constants/design";

interface MessagesScreenProps {
  conversations: Conversation[];
  onOpenChat: (id: string) => void;
  isTab?: boolean;
  onBack?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onCompose?: () => void;
}

type MsgTab = MessageCategory | "all";

const CATEGORIES: { id: MsgTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "landlord", label: "Landlord" },
  { id: "flatmate", label: "Flatmates" },
  { id: "contractor", label: "Contractors" },
];

export function MessagesScreen({
  conversations,
  onOpenChat,
  isTab = false,
  onBack,
  refreshing,
  onRefresh,
  onCompose,
}: MessagesScreenProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<MsgTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const byCategory =
      filter === "all" ? conversations : conversations.filter((c) => c.category === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.last_message.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q),
    );
  }, [conversations, filter, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenShell
        title="Messages"
        subtitle="Landlord, flatmates & contractors"
        onBack={isTab ? undefined : onBack}
        refreshing={refreshing}
        onRefresh={onRefresh}
      >
        <TextInput
          style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
          placeholder="Search messages..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <SegmentTabs tabs={CATEGORIES} active={filter} onChange={setFilter} />

        {filtered.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No conversations"
            subtitle="Messages with your landlord and flatmates will appear here."
          />
        ) : (
          filtered.map((c) => (
            <ConversationRow key={c.id} conversation={c} onPress={() => onOpenChat(c.id)} />
          ))
        )}
      </ScreenShell>

      {onCompose && (
        <Pressable
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={onCompose}
          accessibilityLabel="Compose message"
        >
          <Text style={styles.fabIcon}>✎</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabIcon: { color: "#fff", fontSize: 22, fontWeight: "800" },
});
