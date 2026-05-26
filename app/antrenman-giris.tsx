import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ExerciseEntry, WorkoutSession } from "./antrenman";

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const TR_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function formatFullDate(d: Date) {
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${TR_DAYS[d.getDay()]}`;
}

function emptyExercise(): ExerciseEntry {
  return {
    id: `${Date.now()}_${Math.random()}`,
    name: "",
    sets: "",
    weight: "",
    reps: "",
    rir: "",
    note: "",
  };
}

export default function AntrenmanGirisScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [sessionDate, setSessionDate] = useState(new Date());
  const [sessionName, setSessionName] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([emptyExercise()]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isEdit) { setLoaded(true); return; }
    AsyncStorage.getItem("workoutSessions").then((raw) => {
      if (!raw) { setLoaded(true); return; }
      const all: WorkoutSession[] = JSON.parse(raw);
      const found = all.find((s) => s.id === id);
      if (found) {
        setSessionName(found.sessionName);
        setExercises(found.exercises.length > 0 ? found.exercises : [emptyExercise()]);
        setSessionDate(new Date(found.date));
      }
      setLoaded(true);
    });
  }, [id]);

  function updateExercise(exId: string, field: keyof ExerciseEntry, value: string) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exId ? { ...ex, [field]: value } : ex))
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(exId: string) {
    setExercises((prev) => prev.filter((ex) => ex.id !== exId));
  }

  async function handleSave() {
    if (!sessionName.trim()) {
      Alert.alert("Eksik bilgi", "İdman stili adını gir (örn. Push A).");
      return;
    }
    const filled = exercises.filter((ex) => ex.name.trim());
    if (filled.length === 0) {
      Alert.alert("Eksik bilgi", "En az bir egzersiz adı gir.");
      return;
    }

    const raw = await AsyncStorage.getItem("workoutSessions");
    const existing: WorkoutSession[] = raw ? JSON.parse(raw) : [];

    if (isEdit) {
      const updated = existing.map((s) =>
        s.id === id
          ? { ...s, sessionName: sessionName.trim(), exercises: filled }
          : s
      );
      await AsyncStorage.setItem("workoutSessions", JSON.stringify(updated));
    } else {
      const session: WorkoutSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        sessionName: sessionName.trim(),
        exercises: filled,
      };
      await AsyncStorage.setItem("workoutSessions", JSON.stringify([...existing, session]));
    }

    router.replace("/antrenman");
  }

  if (!loaded) return <View style={styles.container} />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? "Antrenmanı Düzenle" : "Yeni Antrenman"}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Seans Bilgisi */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Seans Bilgisi</Text>

          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Tarih</Text>
            <Text style={styles.dateValue}>{formatFullDate(sessionDate)}</Text>
          </View>

          <Text style={styles.label}>İdman Stili</Text>
          <TextInput
            style={styles.input}
            placeholder="ör. Push A, Çek A, Omuz..."
            placeholderTextColor="#444"
            value={sessionName}
            onChangeText={setSessionName}
          />
        </View>

        {/* Egzersizler */}
        <Text style={styles.sectionHeader}>Egzersizler</Text>

        {exercises.map((ex, idx) => (
          <View key={ex.id} style={styles.exCard}>
            <View style={styles.exCardHeader}>
              <Text style={styles.exCardTitle}>Egzersiz {idx + 1}</Text>
              {exercises.length > 1 && (
                <TouchableOpacity onPress={() => removeExercise(ex.id)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Egzersiz Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="ör. Bench Press, Squat..."
              placeholderTextColor="#444"
              value={ex.name}
              onChangeText={(v) => updateExercise(ex.id, "name", v)}
            />

            <View style={styles.row}>
              <View style={styles.rowField}>
                <Text style={styles.label}>Set</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  value={ex.sets}
                  onChangeText={(v) => updateExercise(ex.id, "sets", v.replace(/[^0-9]/g, ""))}
                />
              </View>
              <View style={styles.rowField}>
                <Text style={styles.label}>Kilo (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="80"
                  placeholderTextColor="#444"
                  keyboardType="decimal-pad"
                  value={ex.weight}
                  onChangeText={(v) => updateExercise(ex.id, "weight", v.replace(/[^0-9.]/g, ""))}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.rowField}>
                <Text style={styles.label}>Tekrar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  value={ex.reps}
                  onChangeText={(v) => updateExercise(ex.id, "reps", v.replace(/[^0-9]/g, ""))}
                />
              </View>
              <View style={styles.rowField}>
                <Text style={styles.label}>RIR</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  value={ex.rir}
                  onChangeText={(v) => updateExercise(ex.id, "rir", v.replace(/[^0-9]/g, ""))}
                />
              </View>
            </View>

            <Text style={styles.label}>Not (opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="ör. Omuzlar daha dik durdu..."
              placeholderTextColor="#444"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={ex.note}
              onChangeText={(v) => updateExercise(ex.id, "note", v)}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addExBtn} onPress={addExercise}>
          <Text style={styles.addExBtnText}>+ Egzersiz Ekle</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{isEdit ? "Güncelle" : "Kaydet"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  sectionHeader: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateLabel: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
  },
  dateValue: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "600",
  },
  label: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 15,
    marginBottom: 10,
  },
  noteInput: {
    minHeight: 72,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  rowField: {
    flex: 1,
  },
  exCard: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  exCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exCardTitle: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: {
    color: "#888",
    fontSize: 18,
    lineHeight: 20,
  },
  addExBtn: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    borderStyle: "dashed",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  addExBtnText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  actions: {
    gap: 10,
  },
  saveBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
  },
  cancelBtn: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },
});
