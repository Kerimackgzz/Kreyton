import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const categories = [
  { name: "Market", color: "#2F80ED" },
  { name: "Yemek", color: "#C93A3A" },
  { name: "Ulaşım", color: "#F4B63F" },
  { name: "Spor", color: "#2E7D32" },
  { name: "Diğer", color: "#6D28D9" },
];

export default function AddExpenseScreen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Market");
  const [note, setNote] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const today = new Date().toLocaleDateString("tr-TR");

  const selectedCategory = categories.find((item) => item.name === category);

  const handleTitleChange = (text: string) => {
    const onlyLetters = text.replace(/[0-9]/g, "");
    setTitle(onlyLetters);
  };

  const handlePriceChange = (text: string) => {
    const onlyNumbers = text.replace(/[^0-9.,]/g, "");
    setPrice(onlyNumbers);
  };

  const handleSave = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert("Eksik bilgi", "Harcama adı ve fiyat alanı boş bırakılamaz.");
      return;
    }

    const numericPrice = Number(price.replace(",", "."));

    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert("Geçersiz fiyat", "Lütfen geçerli bir fiyat gir.");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      title: title.trim(),
      price: numericPrice,
      category,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    try {
      const storedExpenses = await AsyncStorage.getItem("expenses");
      const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];

      const updatedExpenses = [newExpense, ...expenses];

      await AsyncStorage.setItem("expenses", JSON.stringify(updatedExpenses));

      setTitle("");
      setPrice("");
      setCategory("Market");
      setNote("");
      setSuccessMessage("Harcama başarıyla kaydedildi.");

      setTimeout(() => {
        router.replace("/budget");
      }, 900);
    } catch (error) {
      Alert.alert("Hata", "Harcama kaydedilirken bir sorun oluştu.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Yeni Harcama</Text>
      <Text style={styles.subtitle}>Günlük bütçene yeni bir gider ekle</Text>

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        <Text style={styles.label}>Harcama Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Tavuk, kahve, otobüs"
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={handleTitleChange}
        />

        <Text style={styles.label}>Fiyat</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 120"
          placeholderTextColor="#64748b"
          keyboardType="decimal-pad"
          value={price}
          onChangeText={handlePriceChange}
        />

        <Text style={styles.label}>Kategori</Text>
        <View style={styles.categoryWrap}>
          {categories.map((item) => {
            const isActive = category === item.name;

            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.categoryButton,
                  {
                    borderColor: item.color,
                    backgroundColor: isActive ? item.color : "#0b1120",
                  },
                ]}
                onPress={() => setCategory(item.name)}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: isActive ? "#ffffff" : item.color },
                  ]}
                />

                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.selectedCategoryBox,
            { borderColor: selectedCategory?.color || "#1e293b" },
          ]}
        >
          <Text style={styles.selectedCategoryText}>
            Seçilen kategori: {category}
          </Text>
        </View>

        <Text style={styles.label}>Tarih</Text>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{today}</Text>
        </View>

        <Text style={styles.label}>Not</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="İsteğe bağlı not"
          placeholderTextColor="#64748b"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Harcamayı Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    padding: 20,
    paddingTop: 70,
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 24,
    fontWeight: "600",
  },
  successBox: {
    backgroundColor: "#123524",
    borderWidth: 1,
    borderColor: "#2E7D32",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  successText: {
    color: "#d1fae5",
    fontSize: 14,
    fontWeight: "900",
  },
  formCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  label: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#0b1120",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  noteInput: {
    height: 90,
    textAlignVertical: "top",
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
  },
  categoryText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "900",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  selectedCategoryBox: {
    backgroundColor: "#0b1120",
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginTop: 12,
  },
  selectedCategoryText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "800",
  },
  dateBox: {
    backgroundColor: "#0b1120",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
  },
  dateText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  saveButton: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 22,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cancelButtonText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "800",
  },
});