import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View className="flex-row items-start justify-between pt-4 pb-5">
      <View className="flex-1 pr-4">
        <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}
