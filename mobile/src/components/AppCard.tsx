import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function AppCard({ children, className = "", elevated = false, ...props }: AppCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className={`rounded-2xl p-4 ${className}`}
      style={{
        backgroundColor: elevated ? colors.cardElevated : colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: isDark ? "#000" : "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
        elevation: 4,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
