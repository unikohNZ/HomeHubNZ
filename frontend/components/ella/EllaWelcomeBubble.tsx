import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { getRandomCatQuote } from "../../src/constants/ellaQuotes";
import { ELLA_PAGE } from "../../src/constants/ellaTheme";
import { isLandlordRole } from "../../src/services/ellaService";
import { DemoRole } from "../../types";
import { platformShadow } from "../../utils/platformShadow";

interface EllaWelcomeBubbleProps {
  userName?: string;
  role?: DemoRole;
}

function ProFurtyTitle() {
  return (
    <Text style={styles.intro}>
      I'm <Text style={styles.ellaName}>Ella</Text>, your{" "}
      <Text style={styles.bold}>
        <Text style={styles.proFurty}>ProFURty</Text>{" "}
        <Text style={styles.catssistant}>CATssistant</Text>
      </Text>{" "}
      🐾
    </Text>
  );
}

function WelcomeTypingDots() {
  const dot1 = useRef(new Animated.Value(0.35)).current;
  const dot2 = useRef(new Animated.Value(0.35)).current;
  const dot3 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.35, duration: 380, useNativeDriver: true }),
        ]),
      );

    const loops = [pulse(dot1, 0), pulse(dot2, 140), pulse(dot3, 280)];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingRow}>
      <Text style={styles.typingLabel}>Ella is ready</Text>
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

export function EllaWelcomeBubble({ userName, role }: EllaWelcomeBubbleProps) {
  const firstName = userName?.split(" ")[0] ?? "there";
  const quote = useMemo(() => getRandomCatQuote(), []);
  const landlord = isLandlordRole(role);

  const body = landlord
    ? "I keep an eye on rent, tenants, maintenance, and all the meow-ving parts of your properties."
    : "Need help with rent, flatmates, house rules, maintenance requests, or finding important documents?";

  const closing = landlord
    ? "Just ask and I'll do the cat work for you. 😸"
    : "Just give me a meow and I'll help you sort it. 😸";

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.bubble,
          platformShadow("0px 8px 24px rgba(124, 58, 237, 0.28)", {
            shadowColor: ELLA_PAGE.purple,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.28,
            shadowRadius: 20,
            elevation: 8,
          }),
        ]}
      >
        <View style={styles.tail} />
        <View style={styles.greetingRow}>
          <Text style={styles.paw}>🐾</Text>
          <Text style={styles.greeting}>Hi {firstName}! 👋</Text>
        </View>
        <ProFurtyTitle />
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.closing}>{closing}</Text>
        <Text style={styles.quote}>🐾 "{quote}"</Text>
      </View>
      <WelcomeTypingDots />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 4,
    marginBottom: 8,
    zIndex: 3,
  },
  bubble: {
    backgroundColor: ELLA_PAGE.purple,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  tail: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    width: 20,
    height: 20,
    backgroundColor: ELLA_PAGE.purple,
    borderRadius: 4,
    transform: [{ rotate: "45deg" }],
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  paw: { fontSize: 20 },
  greeting: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  intro: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 26,
    marginBottom: 12,
  },
  ellaName: { fontWeight: "800", color: "#FFFFFF" },
  bold: { fontWeight: "800" },
  proFurty: { color: ELLA_PAGE.purpleLight, fontWeight: "800" },
  catssistant: { color: ELLA_PAGE.yellow, fontWeight: "800" },
  body: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "500",
    marginBottom: 10,
  },
  closing: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  quote: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
    fontWeight: "500",
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 6,
  },
  typingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: ELLA_PAGE.textMuted,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ELLA_PAGE.purple,
  },
});
