import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  primary: "#3B82F6",
  primaryLight: "#DBEAFE",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  tabBar: "#FFFFFF",
};

const darkColors = {
  background: "#0F172A",
  surface: "#1E293B",
  card: "#1E293B",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  border: "#334155",
  primary: "#3B82F6",
  primaryLight: "#1E3A8A",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  tabBar: "#1E293B",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("system");

  const isDark = theme === "system" ? systemScheme === "dark" : theme === "dark";
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
