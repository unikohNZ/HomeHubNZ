/** Ella AI — canonical theme tokens */
export const ELLA_PAGE = {
  background: "#FFF8F0",
  card: "#FFFFFF",
  purple: "#7C3AED",
  purpleDark: "#4C1D95",
  purpleLight: "#E9D5FF",
  yellow: "#FFD84D",
  blue: "#4F86F7",
  text: "#1F2937",
  mutedText: "#6B7280",
  border: "#E5E7EB",
  success: "#22C55E",
  // Aliases used by Ella UI components
  purpleMuted: "#E9D5FF",
  purpleGlow: "rgba(124, 58, 237, 0.25)",
  yellowGlow: "rgba(255, 216, 77, 0.45)",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  online: "#22C55E",
  userBubble: "#7C3AED",
  ellaBubble: "#F3F0FA",
  gradientTop: "#F3EEFF",
  gradientMid: "#FFF8F0",
  bubbleTail: "#7C3AED",
} as const;

export const ELLA_IMAGES = {
  avatar: require("../../assets/ella/ella-avatar.png"),
  wave: require("../../assets/ella/ella-wave.png"),
  thinking: require("../../assets/ella/ella-thinking.png"),
  happy: require("../../assets/ella/ella-happy.png"),
} as const;
