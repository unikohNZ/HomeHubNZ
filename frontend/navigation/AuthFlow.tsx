import { Platform, StyleSheet, View } from "react-native";
import {
  AuthFlowProvider,
  useAuthFlowScreen,
} from "../contexts/AuthFlowContext";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { PHONE_MAX, authColors } from "../components/auth/authTheme";

function AuthScreenRouter() {
  const screen = useAuthFlowScreen();

  switch (screen) {
    case "Register":
      return <RegisterScreen />;
    case "ForgotPassword":
      return <ForgotPasswordScreen />;
    case "Login":
    default:
      return <LoginScreen />;
  }
}

export function AuthFlow() {
  return (
    <View style={styles.shell}>
      <View style={styles.phone}>
        <AuthFlowProvider>
          <AuthScreenRouter />
        </AuthFlowProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: authColors.gradientEnd,
    ...(Platform.OS === "web" ? { minHeight: "100vh" as unknown as number } : {}),
  },
  phone: {
    flex: 1,
    width: "100%",
    maxWidth: PHONE_MAX,
  },
});
