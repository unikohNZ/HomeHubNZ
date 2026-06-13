import { useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SubScreenLayout } from "../components/SubScreenLayout";
import { useTheme } from "../context/ThemeContext";
import { GalleryImage } from "../types/flatExtended";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMG_WIDTH = Math.min(SCREEN_WIDTH - 40, 390);

interface GalleryScreenProps {
  images: GalleryImage[];
  onBack: () => void;
}

export function GalleryScreen({ images, onBack }: GalleryScreenProps) {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (x: number) => {
    const i = Math.round(x / IMG_WIDTH);
    setIndex(Math.min(images.length - 1, Math.max(0, i)));
  };

  return (
    <SubScreenLayout title="Property Gallery" subtitle="Swipe to explore rooms" onBack={onBack}>
      <View style={styles.counter}>
        <Text style={[styles.counterText, { color: theme.textMuted }]}>
          {index + 1} / {images.length}
        </Text>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => onScroll(e.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {images.map((img) => (
          <Pressable key={img.id} onPress={() => setFullscreen(true)}>
            <Image source={{ uri: img.uri }} style={[styles.image, { width: IMG_WIDTH }]} />
            <Text style={[styles.label, { color: theme.text }]}>{img.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i === index ? theme.primary : theme.border }]}
          />
        ))}
      </View>

      <Modal visible={fullscreen} transparent animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <Pressable style={[styles.modal, { backgroundColor: theme.overlay }]} onPress={() => setFullscreen(false)}>
          <Image source={{ uri: images[index]?.uri }} style={styles.fullImage} resizeMode="contain" />
          <Text style={[styles.fullLabel, { color: theme.text }]}>{images[index]?.label}</Text>
        </Pressable>
      </Modal>
    </SubScreenLayout>
  );
}

const styles = StyleSheet.create({
  counter: { alignItems: "flex-end", marginBottom: 8 },
  counterText: { fontSize: 13, fontWeight: "700" },
  carousel: { marginHorizontal: -20 },
  image: { height: 220, borderRadius: 20, marginHorizontal: 0 },
  label: { fontSize: 16, fontWeight: "700", marginTop: 10, textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  modal: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  fullImage: { width: "100%", height: "70%" },
  fullLabel: { fontSize: 18, fontWeight: "800", marginTop: 16 },
});
