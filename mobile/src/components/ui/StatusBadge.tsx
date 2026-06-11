import React from "react";
import { Text, View } from "react-native";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "#D1FAE5", text: "#065F46" },
  pending: { bg: "#FEF3C7", text: "#92400E" },
  overdue: { bg: "#FEE2E2", text: "#991B1B" },
  submitted: { bg: "#DBEAFE", text: "#1E40AF" },
  reviewing: { bg: "#E0E7FF", text: "#3730A3" },
  assigned: { bg: "#FEF3C7", text: "#92400E" },
  in_progress: { bg: "#FED7AA", text: "#9A3412" },
  completed: { bg: "#D1FAE5", text: "#065F46" },
  low: { bg: "#F1F5F9", text: "#475569" },
  medium: { bg: "#FEF3C7", text: "#92400E" },
  high: { bg: "#FED7AA", text: "#9A3412" },
  urgent: { bg: "#FEE2E2", text: "#991B1B" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] || { bg: "#F1F5F9", text: "#475569" };
  const label = status.replace(/_/g, " ");

  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.bg }}>
      <Text className="text-xs font-semibold capitalize" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}
