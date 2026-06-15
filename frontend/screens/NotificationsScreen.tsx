import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/BrandLogo";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { AppNotification } from "../types/flat";

interface NotificationsScreenProps {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const CATEGORY_LABELS: Record<AppNotification["category"], string> = {
  rent: "Rent",
  bills: "Bills",
  messages: "Messages",
  maintenance: "Maintenance",
  house_rules: "House Rules",
  lease: "Lease",
  join_requests: "Join Requests",
};

export function NotificationsScreen({
  notifications,
  onBack,
  onMarkRead,
  onMarkAllRead,
}: NotificationsScreenProps) {
  const { theme } = useTheme();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <SubScreenLayout
      title="Notifications"
      subtitle={`${unread} unread`}
      onBack={onBack}
      headerRight={
        unread > 0 ? (
          <Pressable onPress={onMarkAllRead}>
            <Text style={[styles.markAll, { color: theme.primary }]}>Mark all read</Text>
          </Pressable>
        ) : undefined
      }
    >
      {notifications.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <BrandLogo variant="icon" size="large" />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No notifications yet</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Rent, bills, messages and alerts will show up here.
          </Text>
        </View>
      ) : (
        notifications.map((n) => (
          <Pressable
            key={n.id}
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: n.read ? theme.card : theme.primaryMuted,
                borderColor: n.read ? theme.border : theme.primary,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => onMarkRead(n.id)}
          >
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: n.badge_color + "22" }]}>
                <Text style={styles.icon}>{n.icon}</Text>
              </View>
              <View style={styles.body}>
                <View style={styles.top}>
                  <Text style={[styles.title, { color: theme.text }]}>{n.title}</Text>
                  {!n.read && (
                    <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                  )}
                </View>
                <View style={[styles.chip, { backgroundColor: n.badge_color + "33" }]}>
                  <Text style={[styles.chipText, { color: n.badge_color }]}>
                    {CATEGORY_LABELS[n.category]}
                  </Text>
                </View>
                <Text style={[styles.message, { color: theme.textSecondary }]}>
                  {n.message}
                </Text>
                <Text style={[styles.time, { color: theme.textMuted }]}>{n.datetime}</Text>
              </View>
            </View>
          </Pressable>
        ))
      )}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  markAll: { fontSize: 13, fontWeight: "700" },
  empty: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  pressed: { opacity: 0.9 },
  row: { flexDirection: "row", gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
  body: { flex: 1 },
  top: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 15, fontWeight: "800", flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 6,
  },
  chipText: { fontSize: 10, fontWeight: "700" },
  message: { fontSize: 13, lineHeight: 19, marginTop: 8 },
  time: { fontSize: 11, marginTop: 6 },
});
