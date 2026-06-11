import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...props }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      className={`rounded-2xl p-4 ${className}`}
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
      {...props}
    >
      {children}
    </View>
  );
}
