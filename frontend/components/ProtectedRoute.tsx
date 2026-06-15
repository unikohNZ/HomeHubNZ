import { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../context/ThemeContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards authenticated app content. When session is missing, renders nothing
 * so the parent gate can show the Login stack.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
