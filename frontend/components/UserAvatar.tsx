import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { initials } from "../utils/format";

interface UserAvatarProps {
  name: string;
  color?: string;
  size?: number;
  online?: boolean;
  imageUri?: string | null;
}

export function UserAvatar({ name, color, size = 48, online, imageUri }: UserAvatarProps) {
  const { theme } = useTheme();
  const bg = color ?? theme.primary;

  return (
    <View>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.28,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size * 0.28,
              backgroundColor: bg,
            },
          ]}
        >
          <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials(name)}</Text>
        </View>
      )}
      {online && (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              borderColor: theme.surface,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontWeight: "800" },
  dot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#22c55e",
    borderWidth: 2,
  },
});
