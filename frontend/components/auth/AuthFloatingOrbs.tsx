import { StyleSheet, View } from "react-native";
import { authColors } from "./authTheme";

const ORBS = [
  { size: 220, top: -60, left: -80, color: "rgba(255, 255, 255, 0.22)" },
  { size: 160, top: 120, right: -50, color: "rgba(255, 255, 255, 0.16)" },
  { size: 280, bottom: 80, left: -100, color: "rgba(4, 20, 45, 0.06)" },
  { size: 140, bottom: -40, right: 20, color: "rgba(255, 216, 77, 0.35)" },
  { size: 100, top: 320, left: 200, color: "rgba(79, 140, 255, 0.18)" },
];

export function AuthFloatingOrbs() {
  return (
    <View style={styles.layer} pointerEvents="none">
      {ORBS.map((orb, i) => (
        <View
          key={i}
          style={[
            styles.orb,
            {
              width: orb.size,
              height: orb.size,
              borderRadius: orb.size / 2,
              backgroundColor: orb.color,
              top: orb.top,
              left: orb.left,
              right: orb.right,
              bottom: orb.bottom,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
  },
});
