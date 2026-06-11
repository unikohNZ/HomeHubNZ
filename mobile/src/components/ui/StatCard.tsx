import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const { colors } = useTheme();
  const iconColor = color || colors.primary;

  return (
    <Card className="flex-1 min-w-[45%]">
      <View className="flex-row items-center justify-between mb-2">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: iconColor + "20" }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      <Text className="text-2xl font-bold" style={{ color: colors.text }}>
        {value}
      </Text>
      <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}
