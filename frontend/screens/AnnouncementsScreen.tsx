import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { Announcement } from "../types/flatExtended";

interface AnnouncementsScreenProps {
  announcements: Announcement[];
  onBack: () => void;
  onMarkRead: (id: string) => void;
  onPin: (id: string) => void;
}

export function AnnouncementsScreen({ announcements, onBack, onMarkRead, onPin }: AnnouncementsScreenProps) {
  const { theme } = useTheme();
  const unread = announcements.filter((a) => !a.read).length;
  const sorted = [...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <SubScreenLayout title="Announcements" subtitle={`${unread} unread`} onBack={onBack}>
      {sorted.map((ann) => (
        <Pressable
          key={ann.id}
          style={[styles.card, {
            backgroundColor: ann.read ? theme.card : theme.primaryMuted,
            borderColor: ann.pinned ? theme.warning : theme.border,
          }]}
          onPress={() => onMarkRead(ann.id)}
        >
          <View style={styles.top}>
            {ann.pinned && <Text style={styles.pin}>📌</Text>}
            <Text style={[styles.title, { color: theme.text, flex: 1 }]}>{ann.title}</Text>
            {!ann.read && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
          </View>
          <Text style={[styles.content, { color: theme.textSecondary }]}>{ann.content}</Text>
          <View style={styles.footer}>
            <Text style={[styles.date, { color: theme.textMuted }]}>{ann.date}</Text>
            <Pressable onPress={() => onPin(ann.id)}>
              <Text style={[styles.pinBtn, { color: theme.primary }]}>{ann.pinned ? "Unpin" : "Pin"}</Text>
            </Pressable>
          </View>
        </Pressable>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  pin: { fontSize: 14 },
  title: { fontSize: 16, fontWeight: "800" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  date: { fontSize: 12 },
  pinBtn: { fontSize: 12, fontWeight: "700" },
});
