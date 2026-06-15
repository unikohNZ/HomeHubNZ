import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp } from "react-native";
import { BRAND_ASSETS } from "../constants/branding";

export type BrandLogoVariant = "light" | "dark" | "icon";
export type BrandLogoSize = "small" | "medium" | "large";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  showWordmark?: boolean;
  style?: StyleProp<ImageStyle>;
}

const ICON_SIZE: Record<BrandLogoSize, number> = {
  small: 32,
  medium: 48,
  large: 80,
};

const LOGO_HEIGHT: Record<BrandLogoSize, number> = {
  small: 28,
  medium: 40,
  large: 52,
};

export function BrandLogo({
  variant = "light",
  size = "medium",
  showWordmark = false,
  style,
}: BrandLogoProps) {
  if (variant === "icon") {
    const dim = ICON_SIZE[size];
    return (
      <Image
        source={BRAND_ASSETS.icon}
        style={[styles.icon, { width: dim, height: dim, borderRadius: size === "large" ? 20 : 12 }, style]}
        resizeMode="cover"
        accessibilityLabel="HomeHub NZ app icon"
      />
    );
  }

  const source = variant === "dark" ? BRAND_ASSETS.dark : BRAND_ASSETS.light;

  return (
    <View style={styles.row}>
      <Image
        source={source}
        style={[
          styles.logo,
          { height: LOGO_HEIGHT[size], width: LOGO_HEIGHT[size] * 3.2 },
          style,
        ]}
        resizeMode="contain"
        accessibilityLabel="HomeHub NZ logo"
      />
      {showWordmark && <Text style={styles.wordmark}>HomeHub NZ</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center" },
  icon: {},
  logo: {},
  wordmark: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#04142D",
    letterSpacing: -0.3,
  },
});
