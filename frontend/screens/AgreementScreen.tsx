import { Pressable, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { FlatAgreement } from "../types/flatExtended";

interface AgreementScreenProps {
  agreement: FlatAgreement;
  onBack: () => void;
  onAccept: () => void;
}

export function AgreementScreen({ agreement, onBack, onAccept }: AgreementScreenProps) {
  const { theme } = useTheme();

  return (
    <SubScreenLayout title="Flatmate Agreement" subtitle="Household rules & acceptance" onBack={onBack}>
      {!agreement.user_accepted && (
        <View style={[styles.warning, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}>
          <Text style={[styles.warningText, { color: theme.warning }]}>Please accept the flatmate agreement</Text>
          <Pressable style={[styles.acceptBtn, { backgroundColor: theme.primary }]} onPress={onAccept}>
            <Text style={styles.acceptBtnText}>Accept Agreement</Text>
          </Pressable>
        </View>
      )}

      {agreement.sections.map((section) => (
        <View key={section.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{section.title}</Text>
          {section.rules.map((rule) => (
            <Text key={rule} style={[styles.rule, { color: theme.textSecondary }]}>✓ {rule}</Text>
          ))}
        </View>
      ))}

      <Text style={[styles.section, { color: theme.text }]}>Accepted By</Text>
      {agreement.acceptances.map((a) => (
        <View key={a.name} style={[styles.acceptRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={styles.check}>{a.accepted ? "✅" : "⬜"}</Text>
          <View style={styles.flex}>
            <Text style={[styles.name, { color: theme.text }]}>{a.name}</Text>
            {a.date && <Text style={[styles.date, { color: theme.textMuted }]}>{a.date}</Text>}
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  warning: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  warningText: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  acceptBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  acceptBtnText: { color: "#fff", fontWeight: "700" },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
  rule: { fontSize: 14, lineHeight: 22 },
  section: { fontSize: 17, fontWeight: "800", marginTop: 8, marginBottom: 10 },
  acceptRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  check: { fontSize: 18 },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  date: { fontSize: 12, marginTop: 2 },
});
