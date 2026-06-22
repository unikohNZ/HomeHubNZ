import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { radius, spacing } from "../../../constants/design";
import { useTheme } from "../../../context/ThemeContext";
import { ELLA_PAGE } from "../../../src/constants/ellaTheme";
import {
  coordsForLabel,
  getRecentLocations,
  LOCATION_SUGGESTIONS,
  matchSuggestion,
} from "../../../src/services/locationService";

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: {
    preferred_location_name: string;
    preferred_latitude?: number | null;
    preferred_longitude?: number | null;
  }) => Promise<void>;
  initialName?: string | null;
}

export function LocationModal({ visible, onClose, onSave, initialName }: LocationModalProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState(initialName ?? "");
  const [recent, setRecent] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSearch(initialName ?? "");
      setError(null);
      getRecentLocations().then(setRecent);
    }
  }, [visible, initialName]);

  const suggestions = matchSuggestion(search);

  const handleSave = async (name: string, lat?: number | null, lng?: number | null) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a suburb, city, or address.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let latitude = lat ?? null;
      let longitude = lng ?? null;
      if (latitude == null || longitude == null) {
        const guessed = coordsForLabel(trimmed);
        if (guessed) {
          latitude = guessed.latitude;
          longitude = guessed.longitude;
        }
      }
      await onSave({
        preferred_location_name: trimmed,
        preferred_latitude: latitude,
        preferred_longitude: longitude,
      });
      onClose();
    } catch {
      setError("Could not save location. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Search manually instead.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      let label = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const place = places[0];
        if (place) {
          const parts = [place.subregion, place.city, place.region].filter(Boolean);
          if (parts.length) label = parts.join(", ");
        }
      } catch {
        // keep coordinate label
      }
      setSearch(label);
      await handleSave(label, pos.coords.latitude, pos.coords.longitude);
    } catch {
      setError("Could not get current location.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={styles.handle} />
          <Text style={[styles.title, { color: theme.text }]}>Set your rental search location</Text>

          <Pressable
            style={[styles.gpsBtn, { backgroundColor: ELLA_PAGE.purple }]}
            onPress={useCurrentLocation}
            disabled={locating || saving}
          >
            {locating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.gpsText}>📍 Use current location</Text>
            )}
          </Pressable>

          <Text style={[styles.section, { color: theme.textMuted }]}>Search manually</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]}
            placeholder="Search suburb, city, or address"
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {suggestions.map((s) => (
              <Pressable
                key={s.label}
                style={[styles.row, { borderBottomColor: theme.border }]}
                onPress={() => handleSave(s.label, s.latitude, s.longitude)}
              >
                <Text style={[styles.rowText, { color: theme.text }]}>{s.label}</Text>
              </Pressable>
            ))}

            {recent.length > 0 && (
              <>
                <Text style={[styles.section, { color: theme.textMuted, marginTop: spacing.md }]}>
                  Recent locations
                </Text>
                {recent.map((r) => (
                  <Pressable
                    key={r}
                    style={[styles.row, { borderBottomColor: theme.border }]}
                    onPress={() => handleSave(r)}
                  >
                    <Text style={[styles.rowText, { color: theme.text }]}>{r}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.saveBtn, { backgroundColor: theme.primary }, saving && styles.disabled]}
            onPress={() => handleSave(search)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save location</Text>
            )}
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6, 20, 43, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.xl,
    maxHeight: "88%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(124,58,237,0.25)",
    alignSelf: "center",
    marginVertical: spacing.md,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: spacing.lg },
  gpsBtn: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  gpsText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  section: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  list: { maxHeight: 220, marginBottom: spacing.md },
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  rowText: { fontSize: 15, fontWeight: "600" },
  error: { color: "#EF4444", fontSize: 13, marginBottom: spacing.sm },
  saveBtn: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  cancel: { alignItems: "center", paddingVertical: spacing.md },
  cancelText: { fontSize: 14, fontWeight: "600" },
});
