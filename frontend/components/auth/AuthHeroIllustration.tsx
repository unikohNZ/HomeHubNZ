import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { authColors } from "./authTheme";
import { spacing } from "../../constants/design";
import { USE_NATIVE_DRIVER } from "../../utils/animation";
import { platformShadow } from "../../utils/platformShadow";

export function AuthHeroIllustration() {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY }] }]}>
      <View style={styles.glow} />
      <View style={styles.scene}>
        <View style={styles.houseBase}>
          <View style={styles.roof} />
          <View style={styles.houseBody}>
            <View style={styles.windowRow}>
              <View style={styles.window} />
              <View style={styles.window} />
            </View>
            <View style={styles.door} />
          </View>
        </View>
        <View style={styles.people}>
          {["🧑‍💼", "👩‍🎓", "🧑‍🍳"].map((emoji, i) => (
            <View key={i} style={[styles.avatar, i === 1 && styles.avatarCenter]}>
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.caption}>Your flat, your crew, your hub</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  glow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    top: 10,
  },
  scene: {
    alignItems: "center",
    paddingTop: spacing.md,
  },
  houseBase: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 52,
    borderRightWidth: 52,
    borderBottomWidth: 36,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: authColors.navy,
    marginBottom: -2,
  },
  houseBody: {
    width: 88,
    height: 72,
    backgroundColor: authColors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: authColors.navy,
    padding: 8,
    justifyContent: "space-between",
    ...platformShadow("0px 6px 12px rgba(4, 20, 45, 0.15)", {
      shadowColor: "#04142D",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    }),
  },
  windowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  window: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "rgba(79, 140, 255, 0.35)",
    borderWidth: 1.5,
    borderColor: authColors.primary,
  },
  door: {
    alignSelf: "center",
    width: 22,
    height: 28,
    borderRadius: 4,
    backgroundColor: authColors.accent,
    borderWidth: 1.5,
    borderColor: authColors.navy,
  },
  people: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: authColors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    ...platformShadow("0px 4px 8px rgba(4, 20, 45, 0.12)", {
      shadowColor: "#04142D",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  avatarCenter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 6,
    borderColor: authColors.primary,
    borderWidth: 2.5,
  },
  avatarEmoji: { fontSize: 22 },
  caption: {
    marginTop: spacing.md,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(4, 20, 45, 0.72)",
    letterSpacing: 0.2,
  },
});
