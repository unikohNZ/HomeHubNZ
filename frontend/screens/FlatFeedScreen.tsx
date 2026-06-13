import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { FeedPost, FeedPostType } from "../types/flat";

interface FlatFeedScreenProps {
  posts: FeedPost[];
  onBack: () => void;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onAddPost: (content: string) => void;
}

const FILTERS: { id: FeedPostType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bill", label: "Bills" },
  { id: "chore", label: "Chores" },
  { id: "maintenance", label: "Maintenance" },
  { id: "landlord", label: "Landlord" },
];

export function FlatFeedScreen({
  posts,
  onBack,
  onLike,
  onComment,
  onAddPost,
}: FlatFeedScreenProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<FeedPostType | "all">("all");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p) => p.type === filter)),
    [posts, filter],
  );

  return (
    <SubScreenLayout title="Flat Feed" subtitle="Household updates & activity" onBack={onBack}>
      <View style={[styles.compose, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Share an update..."
          placeholderTextColor={theme.textMuted}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable
          style={[styles.postBtn, { backgroundColor: theme.primary }]}
          onPress={() => {
            if (draft.trim()) {
              onAddPost(draft.trim());
              setDraft("");
            }
          }}
        >
          <Text style={styles.postBtnText}>Post Update</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f.id ? theme.primaryMuted : theme.card,
                borderColor: filter === f.id ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={{ color: filter === f.id ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: "700" }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.map((post) => (
        <View
          key={post.id}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <View style={styles.header}>
            <Text style={[styles.author, { color: theme.text }]}>{post.author}</Text>
            <Text style={[styles.time, { color: theme.textMuted }]}>{post.timestamp}</Text>
          </View>
          <Text style={[styles.role, { color: theme.textMuted }]}>{post.role}</Text>
          <Text style={[styles.content, { color: theme.textSecondary }]}>{post.content}</Text>
          <View style={[styles.typeChip, { backgroundColor: theme.primaryMuted }]}>
            <Text style={[styles.typeText, { color: theme.primary }]}>{post.type}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.action} onPress={() => onLike(post.id)}>
              <Text style={{ color: post.liked ? theme.danger : theme.textMuted }}>
                {post.liked ? "❤️" : "🤍"} {post.likes}
              </Text>
            </Pressable>
            <Pressable style={styles.action} onPress={() => onComment(post.id)}>
              <Text style={{ color: theme.textMuted }}>💬 Comment</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  compose: { borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 14 },
  input: { fontSize: 15, minHeight: 60, textAlignVertical: "top" },
  postBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  postBtnText: { color: "#fff", fontWeight: "700" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  author: { fontSize: 15, fontWeight: "800" },
  time: { fontSize: 11 },
  role: { fontSize: 12, marginTop: 2 },
  content: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  typeChip: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 10 },
  typeText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  actions: { flexDirection: "row", gap: 20, marginTop: 12 },
  action: { paddingVertical: 4 },
});
