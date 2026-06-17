import { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { USE_NATIVE_DRIVER } from "../../utils/animation";

interface AuthAnimatedPressableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function AuthAnimatedPressable({
  style,
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: AuthAnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animateTo = (toScale: number, toOpacity: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        friction: 6,
        tension: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(opacity, {
        toValue: toOpacity,
        duration: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) animateTo(0.97, 0.92);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1, 1);
        onPressOut?.(e);
      }}
      {...(Platform.OS === "web"
        ? {
            onHoverIn: () => {
              if (!disabled) animateTo(1.01, 0.96);
            },
            onHoverOut: () => animateTo(1, 1),
          }
        : {})}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
