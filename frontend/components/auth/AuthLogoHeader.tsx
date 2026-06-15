import { StyleSheet, Text, View } from "react-native";
import { authColors } from "./authTheme";
import { spacing } from "../../constants/design";

interface AuthLogoHeaderProps {
  subtitle?: string;
}

export function AuthLogoHeader({
  subtitle = "Your flat, rent & household hub",
}: AuthLogoHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🏠</Text>
      </View>
      <Text style={styles.brand}>HomeHub NZ</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: authColors.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#04142D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: { fontSize: 36 },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: authColors.navy,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: authColors.muted,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
});
