import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type ExerciseEntry = {
  id: string;
  name: string;
  sets: string;
  weight: string;
  reps: string;
  rir: string;
  note: string;
};

export type WorkoutSession = {
  id: string;
  date: string;
  sessionName: string;
  exercises: ExerciseEntry[];
};

const TR_MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function AntrenmanScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("workoutSessions").then((raw) => {
        if (raw) setSessions(JSON.parse(raw));
        else setSessions([]);
      });
    }, [])
  );

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Antrenman Programı</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedSessions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Henüz antrenman yok</Text>
            <Text style={styles.emptyText}>
              Aşağıdaki butona basarak ilk seansını ekle.
            </Text>
          </View>
        ) : (
          sortedSessions.map((session) => (
            <View key={session.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <Text style={styles.cardName}>{session.sessionName}</Text>
                  <Text style={styles.cardDate}>{formatShortDate(session.date)}</Text>
                </View>
                <Text style={styles.cardCount}>
                  {session.exercises.length} egzersiz
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => router.push(`/antrenman-giris?id=${session.id}`)}
                activeOpacity={0.7}
              >
                <Text style={styles.editBtnText}>Düzenle →</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.addBtnWrap}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/antrenman-giris")}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ Yeni Antrenman</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: 20,
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
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 16,
  },
  empty: {
    marginTop: 80,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardLeft: {
    gap: 4,
  },
  cardName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  cardDate: {
    color: "#555",
    fontSize: 13,
  },
  cardCount: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  editBtn: {
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 12,
    alignItems: "flex-end",
  },
  editBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  addBtnWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  addBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  addBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
