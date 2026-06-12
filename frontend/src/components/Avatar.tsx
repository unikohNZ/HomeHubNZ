import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/theme";

interface AvatarProps {
  label: string;
  size?: number;
  color?: string;
  online?: boolean;
}

export function Avatar({ label, size = 44, color = colors.primary, online }: AvatarProps) {
  return (
    <View>
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ]}
      >
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{label}</Text>
      </View>
      {online && (
        <View
          style={[
            styles.online,
            { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.white,
    fontWeight: "700",
  },
  online: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
