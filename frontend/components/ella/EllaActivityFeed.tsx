import { StyleSheet, Text, View } from "react-native";
import { ELLA_PAGE } from "../../src/constants/ellaTheme";
import { EllaActivityItem } from "../../src/services/ellaService";
import { platformShadow } from "../../utils/platformShadow";

interface EllaActivityFeedProps {
  items: EllaActivityItem[];
}

export function EllaActivityFeed({ items }: EllaActivityFeedProps) {
  if (items.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        platformShadow("0px 2px 12px rgba(0,0,0,0.04)", {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }),
      ]}
    >
      {items.map((item, i) => (
        <View
          key={item.id}
          style={[styles.row, i < items.length - 1 && styles.rowBorder]}
        >
          <Text style={styles.icon}>{item.icon}</Text>
          <View style={styles.body}>
            <Text style={styles.text}>{item.text}</Text>
            {item.time ? <Text style={styles.time}>{item.time}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ELLA_PAGE.card,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.06)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(124, 58, 237, 0.06)",
  },
  icon: { fontSize: 20, width: 28 },
  body: { flex: 1 },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: ELLA_PAGE.text,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontWeight: "600",
    color: ELLA_PAGE.textMuted,
    marginTop: 2,
  },
});
