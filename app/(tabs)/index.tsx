import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kreyton</Text>
      <Text style={styles.subtitle}>Fitness, diyet ve günlük bütçe takip uygulaman</Text>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Fitness</Text>
        <Text style={styles.blockText}>
          Antrenman programlarını, hareketlerini ve gelişimini takip et.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Diyet</Text>
        <Text style={styles.blockText}>
          Günlük kalori, gram ve makro değerlerini manuel gir.
        </Text>
      </View>

      <TouchableOpacity style={styles.activeBlock} onPress={() => router.push("/budget")}>
        <Text style={styles.activeBlockTitle}>Günlük Bütçe / Harcama</Text>
        <Text style={styles.activeBlockText}>
          Ürün adı, fiyat ve kategori girerek günlük harcamalarını takip et.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
    paddingTop: 70,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    marginBottom: 28,
    lineHeight: 22,
  },
  block: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
  },
  blockTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  blockText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 21,
  },
  activeBlock: {
    backgroundColor: "#38bdf8",
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
  },
  activeBlockTitle: {
    color: "#020617",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  activeBlockText: {
    color: "#0f172a",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
});