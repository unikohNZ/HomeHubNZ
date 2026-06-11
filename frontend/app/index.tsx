import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeHub NZ</Text>
      <Text style={styles.subtitle}>Property, Rent & Maintenance Manager</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dashboard Preview</Text>
        <Text>Total Properties: 3</Text>
        <Text>Rent Due: $750</Text>
        <Text>Maintenance Requests: 4</Text>
        <Text>Messages: 8</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#0f172a"
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center"
  },
  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 24
  },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12mpbn
  }
});