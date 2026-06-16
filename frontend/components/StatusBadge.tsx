import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ComputedRentStatus } from "../utils/rentDates";

type StatusTone = "paid" | "upcoming" | "due_today" | "pending" | "overdue" | "neutral";

interface StatusBadgeProps {
  label: string;
  status?: ComputedRentStatus | StatusTone;
}

export function StatusBadge({ label, status = "neutral" }: StatusBadgeProps) {
  const { theme } = useTheme();

  const colors: Record<StatusTone, { bg: string; text: string }> = {
    paid: { bg: theme.successMuted, text: theme.success },
    upcoming: { bg: theme.primaryMuted, text: theme.primary },
    due_today: { bg: theme.warningMuted, text: theme.warning },
    pending: { bg: theme.warningMuted, text: theme.warning },
    overdue: { bg: theme.dangerMuted, text: theme.danger },
    neutral: { bg: theme.cardElevated, text: theme.textSecondary },
  };

  const tone = status === "due_today" ? "pending" : status;
  const palette = colors[tone] ?? colors.neutral;

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontWeight: "700" },
});
