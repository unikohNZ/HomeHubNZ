import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ELLA_IMAGES, ELLA_PAGE } from "../../src/constants/ellaTheme";
import { EllaPreviewMessage } from "../../src/services/ellaService";
import { platformShadow } from "../../utils/platformShadow";

interface EllaChatPreviewProps {
  messages: EllaPreviewMessage[];
  onContinue?: () => void;
}

export function EllaChatPreview({ messages, onContinue }: EllaChatPreviewProps) {
  return (
    <Pressable
      onPress={onContinue}
      style={({ pressed }) => [
        styles.card,
        platformShadow("0px 4px 16px rgba(124, 58, 237, 0.08)", {
          shadowColor: ELLA_PAGE.purple,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 3,
        }),
        pressed && { opacity: 0.95 },
      ]}
    >
      {messages.map((m, i) => (
        <View key={i} style={m.role === "user" ? styles.userRow : styles.ellaRow}>
          {m.role === "assistant" && (
            <Image source={ELLA_IMAGES.avatar} style={styles.avatar} />
          )}
          <View style={m.role === "user" ? styles.userBubble : styles.ellaBubble}>
            <Text style={m.role === "user" ? styles.userLabel : styles.ellaLabel}>
              {m.role === "assistant" ? "Ella" : "You"}
            </Text>
            <Text style={m.role === "user" ? styles.userText : styles.ellaText}>
              {m.content}
            </Text>
          </View>
        </View>
      ))}
      {onContinue && (
        <Text style={styles.continue}>Tap to continue chatting →</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ELLA_PAGE.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ELLA_PAGE.border,
  },
  ellaRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ELLA_PAGE.purpleMuted,
  },
  ellaBubble: {
    flex: 1,
    backgroundColor: ELLA_PAGE.ellaBubble,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: "88%",
  },
  userBubble: {
    backgroundColor: ELLA_PAGE.purple,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: "82%",
  },
  ellaLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: ELLA_PAGE.purple,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  userLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ellaText: {
    fontSize: 14,
    lineHeight: 20,
    color: ELLA_PAGE.text,
    fontWeight: "500",
  },
  userText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  continue: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: ELLA_PAGE.purple,
    marginTop: 4,
  },
});
