import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = "Loading...", fullScreen = false }: LoadingSpinnerProps) {
  const { colors } = useTheme();

  return (
    <View
      className={`items-center justify-center ${fullScreen ? "flex-1" : "py-16"}`}
      style={fullScreen ? { backgroundColor: colors.background } : undefined}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text className="text-sm mt-4 font-medium" style={{ color: colors.textSecondary }}>
          {message}
        </Text>
      )}
    </View>
  );
}
