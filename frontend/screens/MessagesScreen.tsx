import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ConversationRow } from "../components/ConversationRow";
import { ScreenShell } from "../components/ScreenShell";
import { EmptyState } from "../components/ui/EmptyState";
import { SegmentTabs } from "../components/ui/SegmentTabs";
import { useTheme } from "../context/ThemeContext";
import { Conversation, MessageCategory } from "../types/message";
import { spacing } from "../constants/design";

interface MessagesScreenProps {
  conversations: Conversation[];
  onOpenChat: (id: string) => void;
  isTab?: boolean;
  onBack?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
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
}: MessagesScreenProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<MsgTab>("all");

  const filtered =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.category === filter);

  const shell = (
    <ScreenShell
      title="Messages"
      subtitle="Landlord, flatmates & contractors"
      onBack={onBack}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
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
  );

  if (isTab) return shell;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {shell}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
