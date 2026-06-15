import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { authCardStyle } from "./authTheme";
import { spacing } from "../../constants/design";

interface AuthCardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function AuthCard({ children, style }: AuthCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    ...authCardStyle(),
    marginBottom: spacing.lg,
  },
});
