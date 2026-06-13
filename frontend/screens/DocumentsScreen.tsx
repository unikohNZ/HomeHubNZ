import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { DocumentCategory, FlatDocument } from "../types/flatExtended";

const CATEGORIES: { id: DocumentCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "lease", label: "Lease" },
  { id: "house_rules", label: "Rules" },
  { id: "bond_receipt", label: "Bond" },
  { id: "inspection", label: "Inspection" },
  { id: "insurance", label: "Insurance" },
  { id: "utility", label: "Utility" },
];

const CAT_LABELS: Record<DocumentCategory, string> = {
  lease: "Lease Agreement",
  house_rules: "House Rules",
  bond_receipt: "Bond Receipt",
  inspection: "Inspection Report",
  insurance: "Insurance",
  utility: "Utility Agreement",
};

interface DocumentsScreenProps {
  documents: FlatDocument[];
  onBack: () => void;
  onAction: (action: string, name: string) => void;
}

export function DocumentsScreen({ documents, onBack, onAction }: DocumentsScreenProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DocumentCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      const matchCat = filter === "all" || d.category === filter;
      const matchSearch =
        !q ||
        d.file_name.toLowerCase().includes(q) ||
        d.uploaded_by.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [documents, search, filter]);

  return (
    <SubScreenLayout title="Documents" subtitle={`${documents.length} files`} onBack={onBack}>
      <TextInput
        style={[styles.search, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
        placeholder="Search documents..."
        placeholderTextColor={theme.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, { backgroundColor: filter === c.id ? theme.primaryMuted : theme.card, borderColor: filter === c.id ? theme.primary : theme.border }]}
            onPress={() => setFilter(c.id)}
          >
            <Text style={{ color: filter === c.id ? theme.primary : theme.textMuted, fontSize: 11, fontWeight: "700" }}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
      {filtered.map((doc) => (
        <View key={doc.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.pdfIcon, { backgroundColor: theme.dangerMuted }]}>
            <Text style={styles.pdfText}>PDF</Text>
          </View>
          <View style={styles.flex}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>{doc.file_name}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>{CAT_LABELS[doc.category]} · {doc.upload_date}</Text>
            <Text style={[styles.meta, { color: theme.textMuted }]}>By {doc.uploaded_by}</Text>
          </View>
          <View style={styles.actions}>
            {(["View", "Download", "Share"] as const).map((a) => (
              <Pressable key={a} style={[styles.actionBtn, { backgroundColor: theme.primaryMuted }]} onPress={() => onAction(a, doc.file_name)}>
                <Text style={[styles.actionText, { color: theme.primary }]}>{a}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  search: { borderRadius: 14, borderWidth: 1, padding: 12, fontSize: 15, marginBottom: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 10 },
  pdfIcon: { width: 48, height: 56, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  pdfText: { color: "#ef4444", fontWeight: "800", fontSize: 12 },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  actionText: { fontSize: 12, fontWeight: "700" },
});
