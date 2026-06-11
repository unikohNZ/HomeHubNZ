import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  paid: { bg: "#064E3B", text: "#6EE7B7" },
  pending: { bg: "#78350F", text: "#FCD34D" },
  overdue: { bg: "#7F1D1D", text: "#FCA5A5" },
  submitted: { bg: "#1E3A8A", text: "#93C5FD" },
  reviewing: { bg: "#312E81", text: "#C4B5FD" },
  assigned: { bg: "#78350F", text: "#FCD34D" },
  in_progress: { bg: "#7C2D12", text: "#FDBA74" },
  completed: { bg: "#064E3B", text: "#6EE7B7" },
  low: { bg: "#1E293B", text: "#94A3B8" },
  medium: { bg: "#78350F", text: "#FCD34D" },
  high: { bg: "#7C2D12", text: "#FDBA74" },
  urgent: { bg: "#7F1D1D", text: "#FCA5A5" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { isDark } = useTheme();
  const lightFallback = { bg: "#F1F5F9", text: "#475569" };
  const colors = STATUS_COLORS[status] || (isDark ? { bg: "#1E293B", text: "#94A3B8" } : lightFallback);
  const label = status.replace(/_/g, " ");

  return (
    <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.bg }}>
      <Text className="text-xs font-semibold capitalize" style={{ color: colors.text }}>
        {label}
      </Text>
    </View>
  );
}
