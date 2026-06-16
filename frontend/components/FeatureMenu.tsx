import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  DEFAULT_FAVORITE_KEYS,
  FEATURE_CATEGORIES,
  FeatureItem,
  FeatureTabId,
  featureKey,
  findFeatureByKey,
} from "../data/featureCategories";
import { useTheme } from "../context/ThemeContext";
import { SubScreen } from "../types/navigation";
import { radius, spacing } from "../constants/design";
import { FeatureCard } from "./FeatureCard";
import { FeatureCategory } from "./FeatureCategory";
import { SectionHeader } from "./SectionHeader";

interface FeatureMenuProps {
  onNavigate: (screen: SubScreen) => void;
  onNavigateTab?: (tab: FeatureTabId) => void;
  disabled?: boolean;
}

function matchesSearch(item: FeatureItem, query: string): boolean {
  if (!query.trim()) return true;
  return item.label.toLowerCase().includes(query.trim().toLowerCase());
}

export function FeatureMenu({ onNavigate, onNavigateTab, disabled }: FeatureMenuProps) {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([...DEFAULT_FAVORITE_KEYS]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FEATURE_CATEGORIES;

    return FEATURE_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) => matchesSearch(item, q)),
    })).filter((category) => category.items.length > 0);
  }, [search]);

  const pinnedItems = useMemo(
    () =>
      favorites
        .map((key) => findFeatureByKey(key))
        .filter((item): item is FeatureItem => {
          if (!item) return false;
          return matchesSearch(item, search);
        }),
    [favorites, search],
  );

  const handlePress = (item: FeatureItem) => {
    if (item.type === "tab") {
      onNavigateTab?.(item.id);
      return;
    }
    onNavigate(item.id);
  };

  const toggleFavorite = (key: string) => {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={[
          styles.search,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder="Search features..."
        placeholderTextColor={theme.textMuted}
        value={search}
        onChangeText={setSearch}
        accessibilityLabel="Search features"
      />

      {pinnedItems.length > 0 && (
        <>
          <SectionHeader title="Pinned Features" />
          <View style={styles.pinnedGrid}>
            {pinnedItems.map((item) => {
              const key = featureKey(item);
              return (
                <FeatureCard
                  key={key}
                  icon={item.icon}
                  label={item.label}
                  isFavorite
                  onPress={() => handlePress(item)}
                  onToggleFavorite={() => toggleFavorite(key)}
                  disabled={disabled}
                />
              );
            })}
          </View>
        </>
      )}

      {filteredCategories.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No features match your search
          </Text>
        </View>
      ) : (
        filteredCategories.map((category) => (
          <FeatureCategory
            key={category.id}
            title={category.title}
            icon={category.icon}
            count={category.items.length}
            defaultExpanded={search.trim().length > 0 ? true : category.defaultExpanded}
          >
            {category.items.map((item) => {
              const key = featureKey(item);
              return (
                <FeatureCard
                  key={key}
                  icon={item.icon}
                  label={item.label}
                  isFavorite={favorites.includes(key)}
                  onPress={() => handlePress(item)}
                  onToggleFavorite={() => toggleFavorite(key)}
                  disabled={disabled}
                />
              );
            })}
          </FeatureCategory>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  search: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  pinnedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  empty: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, fontWeight: "600" },
});
