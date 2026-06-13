import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { EmergencyContact } from "../types/flat";

interface EmergencyContactsScreenProps {
  contacts: EmergencyContact[];
  onBack: () => void;
  onCall: (name: string, phone: string) => void;
  onMessage: (name: string) => void;
}

export function EmergencyContactsScreen({
  contacts,
  onBack,
  onCall,
  onMessage,
}: EmergencyContactsScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Emergency Contacts" subtitle="Important flat & property contacts" onBack={onBack}>
      {contacts.map((c) => (
        <View
          key={c.id}
          style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.name, { color: theme.text }]}>{c.name}</Text>
          <Text style={[styles.role, { color: theme.primary }]}>{c.role}</Text>
          <Text style={[styles.detail, { color: theme.textSecondary }]}>📞 {c.phone}</Text>
          <Text style={[styles.detail, { color: theme.textSecondary }]}>✉️ {c.email}</Text>
          <Text style={[styles.hours, { color: theme.textMuted }]}>🕐 {c.hours}</Text>
          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, { backgroundColor: theme.success }]}
              onPress={() => onCall(c.name, c.phone)}
            >
              <Text style={styles.btnTextWhite}>Call</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { backgroundColor: theme.primaryMuted }]}
              onPress={() => onMessage(c.name)}
            >
              <Text style={[styles.btnText, { color: theme.primary }]}>Message</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 14 },
  name: { fontSize: 18, fontWeight: "800" },
  role: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  detail: { fontSize: 14, marginTop: 8 },
  hours: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnTextWhite: { color: "#fff", fontWeight: "700" },
  btnText: { fontWeight: "700" },
});
