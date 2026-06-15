import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthFloatingOrbs } from "./auth/AuthFloatingOrbs";
import { authColors } from "./auth/authTheme";

interface AuthGradientLayoutProps {
  children: ReactNode;
}

export function AuthGradientLayout({ children }: AuthGradientLayoutProps) {
  return (
    <LinearGradient
      colors={[authColors.gradientStart, "#A8D4FF", authColors.gradientEnd]}
      locations={[0, 0.45, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <AuthFloatingOrbs />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>{children}</View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: "100%",
  },
  safe: {
    flex: 1,
    width: "100%",
  },
  kav: {
    flex: 1,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 80,
    width: "100%",
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    paddingHorizontal: 20,
    paddingTop: 8,
    alignSelf: "center",
  },
});
