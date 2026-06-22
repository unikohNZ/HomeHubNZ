import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { ELLA_IMAGES, ELLA_PAGE } from "../../src/constants/ellaTheme";
import { platformShadow } from "../../utils/platformShadow";

export function EllaFloatingHero() {
  const floatY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatY, { toValue: -10, duration: 2200, useNativeDriver: true }),
          Animated.timing(floatY, { toValue: 0, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.02, duration: 2200, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 2200, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatY, scale]);

  return (
    <View style={styles.wrap}>
      <View style={styles.glowOrb} />
      <Animated.View
        style={[
          styles.imageWrap,
          platformShadow("0px 16px 40px rgba(124, 58, 237, 0.18)", {
            shadowColor: ELLA_PAGE.purple,
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.22,
            shadowRadius: 24,
            elevation: 12,
          }),
          { transform: [{ translateY: floatY }, { scale }] },
        ]}
      >
        <Image
          source={ELLA_IMAGES.wave}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Ella the cat waving hello"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    height: 270,
    justifyContent: "flex-end",
    marginBottom: -20,
    zIndex: 2,
  },
  glowOrb: {
    position: "absolute",
    bottom: 40,
    width: 180,
    height: 40,
    borderRadius: 90,
    backgroundColor: ELLA_PAGE.purpleGlow,
    transform: [{ scaleX: 1.6 }],
  },
  imageWrap: {
    width: "100%",
    height: 260,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  image: {
    width: "92%",
    height: "100%",
    maxHeight: 280,
  },
});
