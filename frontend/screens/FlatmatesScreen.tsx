import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { UserAvatar } from "../components/UserAvatar";
import { useTheme } from "../context/ThemeContext";
import { FlatmateMember } from "../types/flat";
import { titleCase } from "../utils/format";

interface FlatmatesScreenProps {
  flatmates: FlatmateMember[];
  currentUserId: string;
  onBack: () => void;
  onMessage: (conversationId: string) => void;
  onViewProfile: (name: string) => void;
  onSplitBill: () => void;
}

export function FlatmatesScreen({
  flatmates,
  currentUserId,
  onBack,
  onMessage,
  onViewProfile,
  onSplitBill,
}: FlatmatesScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Flatmates" subtitle="Your flat household directory" onBack={onBack}>
      {flatmates.map((fm) => {
        const rentTone =
          fm.rent_status === "paid"
            ? theme.success
            : fm.rent_status === "overdue"
              ? theme.danger
              : theme.warning;
        const rentBg =
          fm.rent_status === "paid"
            ? theme.successMuted
            : fm.rent_status === "overdue"
              ? theme.dangerMuted
              : theme.warningMuted;

        return (
          <View
            key={fm.id}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.top}>
              <UserAvatar name={fm.name} color={fm.avatar_color} size={52} online={fm.online} />
              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]}>
                  {fm.name}
                  {fm.id === currentUserId ? " (You)" : ""}
                </Text>
                <Text style={[styles.role, { color: theme.textMuted }]}>{fm.role}</Text>
                <View style={[styles.rentBadge, { backgroundColor: rentBg }]}>
                  <Text style={[styles.rentText, { color: rentTone }]}>
                    Rent: {titleCase(fm.rent_status)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[styles.chore, { color: theme.textSecondary }]}>
              🧹 {fm.chore_assignment}
            </Text>
            <View style={styles.actions}>
              {fm.conversation_id && fm.id !== currentUserId && (
                <Pressable
                  style={[styles.btn, { backgroundColor: theme.primaryMuted }]}
                  onPress={() => onMessage(fm.conversation_id!)}
                >
                  <Text style={[styles.btnText, { color: theme.primary }]}>Message</Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => onViewProfile(fm.name)}
              >
                <Text style={[styles.btnText, { color: theme.text }]}>View Profile</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, { backgroundColor: theme.warningMuted }]}
                onPress={onSplitBill}
              >
                <Text style={[styles.btnText, { color: theme.warning }]}>Split Bill</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 14 },
  top: { flexDirection: "row", gap: 14 },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: "800" },
  role: { fontSize: 13, marginTop: 2 },
  rentBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
  },
  rentText: { fontSize: 11, fontWeight: "700" },
  chore: { fontSize: 13, marginTop: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  btnText: { fontSize: 13, fontWeight: "700" },
});
