import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthStackParamList, AuthNavigation } from "../navigation/types";

export type AuthScreen = keyof AuthStackParamList;

interface AuthFlowContextValue {
  navigation: AuthNavigation;
  screen: AuthScreen;
}

const AuthFlowContext = createContext<AuthFlowContextValue | null>(null);

export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<AuthScreen>("Login");

  const value = useMemo<AuthFlowContextValue>(
    () => ({
      screen,
      navigation: {
        navigate: (name) => setScreen(name),
      },
    }),
    [screen],
  );

  return (
    <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>
  );
}

export function useAuthFlowNavigation(): AuthNavigation {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) {
    throw new Error("useAuthFlowNavigation must be used within AuthFlowProvider");
  }
  return ctx.navigation;
}

export function useAuthFlowScreen(): AuthScreen {
  const ctx = useContext(AuthFlowContext);
  if (!ctx) {
    throw new Error("useAuthFlowScreen must be used within AuthFlowProvider");
  }
  return ctx.screen;
}
