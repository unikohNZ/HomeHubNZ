import { Platform, ViewStyle } from "react-native";
import { radius, spacing, touchTarget } from "../../constants/design";

export const PHONE_MAX = 430;

export const authColors = {
  gradientStart: "#FFD84D",
  gradientEnd: "#4F8CFF",
  primary: "#4F8CFF",
  accent: "#FFD84D",
  card: "#FFFFFF",
  navy: "#04142D",
  muted: "#64748B",
  label: "#334155",
  inputBg: "#F8FAFC",
  inputBorder: "#E2E8F0",
  placeholder: "#94A3B8",
  errorBg: "#FEE2E2",
  errorText: "#B91C1C",
  successBg: "#DCFCE7",
  successText: "#166534",
} as const;

export function authCardStyle(): ViewStyle {
  return {
    backgroundColor: authColors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "100%",
    ...Platform.select<ViewStyle>({
      web: {
        borderWidth: 1,
        borderColor: "rgba(4, 20, 45, 0.08)",
      },
      default: {
        shadowColor: "#04142D",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
      },
    }),
  };
}

export const authButton = {
  minHeight: touchTarget,
  borderRadius: radius.lg,
  paddingVertical: 16,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

export const authInput = {
  backgroundColor: authColors.inputBg,
  borderWidth: 1,
  borderColor: authColors.inputBorder,
  borderRadius: radius.lg,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: 15,
  color: authColors.navy,
  minHeight: touchTarget,
};
