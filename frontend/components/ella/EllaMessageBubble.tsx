import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import { ELLA_IMAGES, ELLA_PAGE } from "../../src/constants/ellaTheme";

interface EllaMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  avatarSource?: ImageSourcePropType;
}

export function EllaMessageBubble({ role, content, avatarSource }: EllaMessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <View style={styles.userWrap}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.ellaWrap}>
      <Image
        source={avatarSource ?? ELLA_IMAGES.avatar}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.ellaBubble}>
        <Text style={styles.ellaText}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrap: {
    alignSelf: "flex-end",
    maxWidth: "82%",
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: ELLA_PAGE.userBubble,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  ellaWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "flex-start",
    maxWidth: "88%",
    marginBottom: 12,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ELLA_PAGE.purpleMuted,
  },
  ellaBubble: {
    flex: 1,
    backgroundColor: ELLA_PAGE.ellaBubble,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ellaText: {
    color: ELLA_PAGE.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
});
