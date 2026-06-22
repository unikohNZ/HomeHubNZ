import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { ELLA_IMAGES, ELLA_PAGE } from "../../src/constants/ellaTheme";

export function EllaTypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 320, useNativeDriver: true }),
        ]),
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 160);
    const a3 = pulse(dot3, 320);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.wrap}>
      <Image source={ELLA_IMAGES.thinking} style={styles.avatar} resizeMode="cover" />
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, { opacity: dot1, backgroundColor: ELLA_PAGE.purple }]} />
          <Animated.View style={[styles.dot, { opacity: dot2, backgroundColor: ELLA_PAGE.purple }]} />
          <Animated.View style={[styles.dot, { opacity: dot3, backgroundColor: ELLA_PAGE.purple }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ELLA_PAGE.purpleMuted,
  },
  bubble: {
    backgroundColor: ELLA_PAGE.ellaBubble,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
