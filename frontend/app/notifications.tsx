import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppCard, EmptyState, ScreenHeader } from "@/components";
import { MOCK_NOTIFICATIONS } from "@/data/mockData";
import { colors, radius, spacing } from "@/constants/theme";
import { timeAgo } from "@/utils/format";
import { AppNotification, NotificationType } from "@/types";

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  rent_reminder: "wallet",
  maintenance_update: "construct",
  inspection: "clipboard",
  payment_received: "checkmark-circle",
  message: "chatbubble-ellipses",
};

const ICON_COLORS: Record<NotificationType, string> = {
  rent_reminder: colors.warning,
  maintenance_update: colors.primary,
  inspection: colors.purple,
  payment_received: colors.success,
  message: colors.teal,
};

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="Notifications"
        rightIcon="checkmark-done-outline"
        onRightPress={markAllRead}
      />
      {items.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title="All caught up"
          message="You have no new notifications right now."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => (
            <AppCard
              key={item.id}
              style={styles.card}
              elevated={!item.is_read}
              onPress={() =>
                setItems((prev) =>
                  prev.map((n) =>
                    n.id === item.id ? { ...n, is_read: true } : n,
                  ),
                )
              }
            >
              <View
                style={[
                  styles.icon,
                  { backgroundColor: ICON_COLORS[item.notification_type] + "22" },
                ]}
              >
                <Ionicons
                  name={ICONS[item.notification_type]}
                  size={20}
                  color={ICON_COLORS[item.notification_type]}
                />
              </View>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{item.title}</Text>
                  {!item.is_read && <View style={styles.dot} />}
                </View>
                <Text style={styles.message}>{item.body}</Text>
                <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
              </View>
            </AppCard>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  card: { flexDirection: "row", gap: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { color: colors.text, fontSize: 15, fontWeight: "700", flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  time: { color: colors.textFaint, fontSize: 11, marginTop: 6 },
});
