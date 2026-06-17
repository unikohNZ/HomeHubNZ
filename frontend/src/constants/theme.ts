/**
 * HomeHub NZ design system.
 * Dark navy base with glassmorphism surfaces, blue accents,
 * green success, and orange warning — inspired by Linear, Revolut and Stripe.
 */

import { ViewStyle } from "react-native";
import { platformShadow } from "../../utils/platformShadow";

export const colors = {
  // Backgrounds
  background: "#060d1f",
  backgroundElevated: "#0c1a2e",
  surface: "#152238",
  surfaceElevated: "#1b2c47",
  surfaceGlass: "rgba(21, 34, 56, 0.72)",

  // Borders
  border: "#1e3a5f",
  borderSubtle: "#16263f",

  // Text
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  textFaint: "#475569",

  // Brand / accents
  primary: "#3b82f6",
  primaryMuted: "rgba(59, 130, 246, 0.16)",
  primaryDark: "#1d4ed8",

  // Status
  success: "#22c55e",
  successMuted: "rgba(34, 197, 94, 0.16)",
  successText: "#4ade80",
  warning: "#f59e0b",
  warningMuted: "rgba(245, 158, 11, 0.16)",
  warningText: "#fbbf24",
  danger: "#ef4444",
  dangerMuted: "rgba(239, 68, 68, 0.16)",
  dangerText: "#f87171",
  info: "#38bdf8",

  // Accent palette for charts / avatars
  purple: "#a855f7",
  purpleMuted: "rgba(168, 85, 247, 0.16)",
  teal: "#2dd4bf",

  white: "#ffffff",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: "800" as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: "700" as const },
  subheading: { fontSize: 16, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  label: { fontSize: 13, fontWeight: "600" as const },
  caption: { fontSize: 12, fontWeight: "500" as const },
} as const;

type NativeShadow = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

function makeShadow(webBoxShadow: string, native: NativeShadow) {
  return platformShadow(webBoxShadow, native);
}

export const shadow = {
  card: makeShadow("0px 8px 24px rgba(0, 0, 0, 0.12)", {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  }),
  floating: makeShadow("0px 16px 28px rgba(0, 0, 0, 0.4)", {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 16,
  }),
} as const;

export const theme = { colors, spacing, radius, typography, shadow };
export type Theme = typeof theme;
