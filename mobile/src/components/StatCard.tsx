import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { AppCard } from "./AppCard";

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  trend?: string;
}

export function StatCard({ title, value, icon, color, subtitle, trend }: StatCardProps) {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;

  return (
    <AppCard className="flex-1 min-w-[46%]" elevated>
      <View className="flex-row items-start justify-between mb-3">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center"
          style={{ backgroundColor: iconColor + "22" }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        {trend && (
          <Text className="text-xs font-medium" style={{ color: colors.accent }}>
            {trend}
          </Text>
        )}
      </View>
      <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
        {value}
      </Text>
      <Text className="text-sm font-medium mt-1" style={{ color: colors.textSecondary }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          {subtitle}
        </Text>
      )}
    </AppCard>
  );
}
