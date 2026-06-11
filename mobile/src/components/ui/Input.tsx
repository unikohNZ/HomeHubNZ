import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  const { colors } = useTheme();

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium mb-1.5" style={{ color: colors.text }}>
          {label}
        </Text>
      )}
      <TextInput
        className="rounded-xl px-4 py-3.5 text-base"
        style={{
          backgroundColor: colors.surface,
          color: colors.text,
          borderColor: error ? colors.danger : colors.border,
          borderWidth: 1,
        }}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && (
        <Text className="text-sm mt-1" style={{ color: colors.danger }}>
          {error}
        </Text>
      )}
    </View>
  );
}
