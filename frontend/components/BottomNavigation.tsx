import { useEffect, useRef } from "react";
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ELLA_ASSETS } from "../constants/branding";
import { radius, spacing, touchTarget } from "../constants/design";
import { useTheme } from "../context/ThemeContext";
import { TabId } from "../types";
import { platformShadow } from "../utils/platformShadow";

const ELLA_PURPLE = "#7C3AED";
const ELLA_YELLOW = "#FFD84D";

const MAIN_TABS: { id: TabId; label: string; icon: string; isElla?: boolean }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "ella", label: "Ella", icon: "", isElla: true },
  { id: "payments", label: "Payments", icon: "💰" },
  { id: "profile", label: "Profile", icon: "👤" },
];

interface BottomNavigationProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  unreadMessages?: number;
}

function EllaTabButton({
  isActive,
  onPress,
}: {
  isActive: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Pressable style={styles.ellaWrap} onPress={onPress} accessibilityRole="button" accessibilityLabel="Ella AI">
      <Animated.View
        style={[
          styles.ellaOuter,
          {
            transform: [{ scale: pulse }],
            borderColor: isActive ? ELLA_PURPLE : "rgba(124, 58, 237, 0.3)",
            borderWidth: isActive ? 3 : 2,
          },
          platformShadow(
            isActive ? `0px 0px 28px ${ELLA_YELLOW}` : `0px 0px 14px rgba(124, 58, 237, 0.4)`,
            {
              shadowColor: isActive ? ELLA_YELLOW : ELLA_PURPLE,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isActive ? 0.95 : 0.5,
              shadowRadius: isActive ? 20 : 12,
              elevation: 18,
            },
          ),
        ]}
      >
        <Image source={ELLA_ASSETS.avatar} style={styles.ellaImage} resizeMode="cover" />
      </Animated.View>
      <Text style={[styles.label, { color: isActive ? ELLA_PURPLE : theme.textMuted }]}>Ella</Text>
    </Pressable>
  );
}

export function BottomNavigation({
  active,
  onChange,
  unreadMessages = 0,
}: BottomNavigationProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === "ios" ? 26 : 14,
          ...platformShadow("0px -4px 16px rgba(0, 0, 0, 0.2)", {
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 16,
          }),
        },
      ]}
    >
      {MAIN_TABS.map((tab) => {
        if (tab.isElla) {
          return (
            <EllaTabButton
              key={tab.id}
              isActive={active === tab.id}
              onPress={() => onChange(tab.id)}
            />
          );
        }

        const isActive = active === tab.id;
        const badge = tab.id === "messages" ? unreadMessages : 0;

        return (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => onChange(tab.id)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
          >
            {isActive && <View style={[styles.indicator, { backgroundColor: theme.primary }]} />}
            <View style={[styles.iconBubble, isActive && { backgroundColor: theme.primaryMuted }]}>
              <Text style={[styles.icon, { opacity: isActive ? 1 : 0.55 }]}>{tab.icon}</Text>
              {badge > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: isActive ? theme.primary : theme.textMuted }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    minHeight: 72,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xs,
    minHeight: touchTarget + 8,
    position: "relative",
  },
  ellaWrap: {
    flex: 1,
    alignItems: "center",
    marginTop: -32,
    zIndex: 10,
  },
  ellaOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  ellaImage: { width: 64, height: 64, borderRadius: 32 },
  indicator: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  iconBubble: {
    width: 40,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    position: "relative",
  },
  icon: { fontSize: 20 },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  label: { fontSize: 10, fontWeight: "700" },
});
