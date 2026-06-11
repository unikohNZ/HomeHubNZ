import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  cardElevated: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryMuted: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  tabBar: string;
  gradientStart: string;
  gradientEnd: string;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
}

const lightColors: ThemeColors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardElevated: "#F1F5F9",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  primary: "#3B82F6",
  primaryMuted: "#DBEAFE",
  accent: "#10B981",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  tabBar: "#FFFFFF",
  gradientStart: "#1E40AF",
  gradientEnd: "#0F172A",
};

const darkColors: ThemeColors = {
  background: "#0B1120",
  surface: "#111827",
  card: "#1A2332",
  cardElevated: "#243044",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
  border: "#2D3A4F",
  primary: "#3B82F6",
  primaryMuted: "#1E3A5F",
  accent: "#34D399",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  tabBar: "#111827",
  gradientStart: "#1E3A8A",
  gradientEnd: "#0B1120",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("dark");

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
