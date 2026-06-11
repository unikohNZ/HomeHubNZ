import React from "react";
import { ActivityIndicator, Pressable, PressableProps, Text } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface PrimaryButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  loading?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PrimaryButton({
  title,
  variant = "primary",
  loading = false,
  size = "md",
  disabled,
  className = "",
  ...props
}: PrimaryButtonProps) {
  const { colors } = useTheme();

  const sizeClasses = { sm: "py-2.5 px-4", md: "py-3.5 px-6", lg: "py-4 px-8" };
  const textSizes = { sm: "text-sm", md: "text-base", lg: "text-lg" };

  const variantStyles = {
    primary: { bg: colors.primary, text: "#FFFFFF", border: colors.primary },
    secondary: { bg: colors.cardElevated, text: colors.text, border: colors.border },
    outline: { bg: "transparent", text: colors.primary, border: colors.primary },
    danger: { bg: colors.danger, text: "#FFFFFF", border: colors.danger },
    ghost: { bg: "transparent", text: colors.textSecondary, border: "transparent" },
  };

  const style = variantStyles[variant];

  return (
    <Pressable
      className={`rounded-xl items-center justify-center ${sizeClasses[size]} ${className} ${
        disabled || loading ? "opacity-50" : ""
      }`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: variant === "outline" ? 1.5 : variant === "secondary" ? 1 : 0,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={style.text} />
      ) : (
        <Text className={`font-semibold ${textSizes[size]}`} style={{ color: style.text }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
