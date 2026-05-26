import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import type { ExerciseEntry, WorkoutSession } from "./antrenman";

const screenWidth = Dimensions.get("window").width;

const TR_MONTHS_SHORT = [
  "Oca","Şub","Mar","Nis","May","Haz",
  "Tem","Ağu","Eyl","Eki","Kas","Ara",
];

function shortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${TR_MONTHS_SHORT[d.getMonth()]}`;
}

type ExPoint = { date: string; weight: number; reps: number; rir: number };
type ExProgress = { displayName: string; points: ExPoint[] };

function groupSessionsByName(
  sessions: WorkoutSession[]
): Record<string, WorkoutSession[]> {
  return sessions.reduce((acc, s) => {
    const key = s.sessionName.trim().toLowerCase();
    (acc[key] ??= []).push(s);
    return acc;
  }, {} as Record<string, WorkoutSession[]>);
}

function getExerciseProgress(sessions: WorkoutSession[]): ExProgress[] {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // displayName map: lowercase key → original display name
  const nameMap: Record<string, string> = {};
  const map: Record<string, ExPoint[]> = {};

  for (const session of sorted) {
    // Per session, keep best (highest weight) entry per exercise name
    const best: Record<string, ExerciseEntry> = {};
    for (const ex of session.exercises) {
      if (!ex.name.trim()) continue;
      const key = ex.name.trim().toLowerCase();
      nameMap[key] = ex.name.trim();
      const prev = best[key];
      if (!prev || parseFloat(ex.weight || "0") >= parseFloat(prev.weight || "0")) {
        best[key] = ex;
      }
    }
    for (const [key, ex] of Object.entries(best)) {
      (map[key] ??= []).push({
        date: session.date,
        weight: parseFloat(ex.weight) || 0,
        reps: parseInt(ex.reps) || 0,
        rir: parseInt(ex.rir) || 0,
      });
    }
  }

  return Object.entries(map)
    .filter(([, pts]) => pts.length >= 2)
    .map(([key, pts]) => ({ displayName: nameMap[key] ?? key, points: pts }));
}

function delta(values: number[]): number {
  return values[values.length - 1] - values[0];
}

function deltaText(d: number, unit = "") {
  if (d > 0) return `+${d}${unit}`;
  if (d < 0) return `${d}${unit}`;
  return `±0${unit}`;
}

function deltaColor(d: number): string {
  if (d > 0) return "#34d399";
  if (d < 0) return "#fb7185";
  return "#555";
}

const CHART_CONFIG = {
  backgroundColor: "#111",
  backgroundGradientFrom: "#111",
  backgroundGradientTo: "#111",
  decimalPlaces: 1,
  color: () => "#ffffff",
  labelColor: () => "#555",
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
  propsForBackgroundLines: { stroke: "#222", strokeDasharray: "" },
};

export default function IlerleyisScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("workoutSessions").then((raw) => {
        const all: WorkoutSession[] = raw ? JSON.parse(raw) : [];
        setSessions(all);
        // Auto-select first comparable group
        const grouped = groupSessionsByName(all);
        const firstKey = Object.keys(grouped).find(
          (k) => grouped[k].length >= 2
        );
        setSelectedKey((prev) => prev ?? firstKey ?? null);
      });
    }, [])
  );

  const grouped = groupSessionsByName(sessions);
  const comparableGroups = Object.entries(grouped)
    .filter(([, s]) => s.length >= 2)
    .map(([key, s]) => ({ key, displayName: s[0].sessionName }));

  const activeProgress: ExProgress[] =
    selectedKey && grouped[selectedKey]
      ? getExerciseProgress(grouped[selectedKey])
      : [];

  const hasData = comparableGroups.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>İlerleyiş İstatistikleri</Text>
      </View>

      {!hasData ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Henüz karşılaştırılacak veri yok</Text>
          <Text style={styles.emptyText}>
            Aynı adlı antrenmanı en az 2 kez girerek ilerleyişini takip et.{"\n"}
            Örnek: "Push A" seansını iki farklı günde kaydet.
          </Text>
        </View>
      ) : (
        <>
          {/* Seans Tipi Seçici */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillScroll}
            contentContainerStyle={styles.pillContent}
          >
            {comparableGroups.map(({ key, displayName }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.pill,
                  selectedKey === key && styles.pillActive,
                ]}
                onPress={() => setSelectedKey(key)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedKey === key && styles.pillTextActive,
                  ]}
                >
                  {displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Egzersiz Kartları */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {activeProgress.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Ortak egzersiz bulunamadı</Text>
                <Text style={styles.emptyText}>
                  Bu antrenman stilindeki seanslar arasında en az 2 kez tekrar eden
                  egzersiz yok.
                </Text>
              </View>
            ) : (
              activeProgress.map((ex) => {
                const weightValues = ex.points.map((p) => p.weight);
                const repsValues = ex.points.map((p) => p.reps);
                const rirValues = ex.points.map((p) => p.rir);
                const labels = ex.points.map((p) => shortDate(p.date));

                const wDelta = delta(weightValues);
                const rDelta = delta(repsValues);
                const rirDelta = delta(rirValues);

                // RIR düşüşü iyi (daha zor çalıştın), yükseliş kötü
                const rirDeltaColor =
                  rirDelta < 0 ? "#34d399" : rirDelta > 0 ? "#fb7185" : "#555";

                return (
                  <View key={ex.displayName} style={styles.card}>
                    <Text style={styles.exName}>{ex.displayName.toUpperCase()}</Text>

                    {/* Ağırlık Chart */}
                    <Text style={styles.chartLabel}>Ağırlık (kg)</Text>
                    <View style={styles.chartWrap}>
                      <LineChart
                        data={{
                          labels,
                          datasets: [{ data: weightValues }],
                        }}
                        width={screenWidth - 80}
                        height={140}
                        chartConfig={CHART_CONFIG}
                        bezier
                        withShadow={false}
                        withInnerLines
                        style={styles.chart}
                      />
                    </View>

                    {/* Delta Row */}
                    <View style={styles.deltaRow}>
                      <View style={styles.deltaItem}>
                        <Text style={styles.deltaLabel}>Ağırlık</Text>
                        <Text style={[styles.deltaValue, { color: deltaColor(wDelta) }]}>
                          {deltaText(wDelta, " kg")}
                        </Text>
                      </View>
                      <View style={styles.deltaDivider} />
                      <View style={styles.deltaItem}>
                        <Text style={styles.deltaLabel}>Tekrar</Text>
                        <Text style={[styles.deltaValue, { color: deltaColor(rDelta) }]}>
                          {deltaText(rDelta)}
                        </Text>
                      </View>
                      <View style={styles.deltaDivider} />
                      <View style={styles.deltaItem}>
                        <Text style={styles.deltaLabel}>RIR</Text>
                        <Text style={[styles.deltaValue, { color: rirDeltaColor }]}>
                          {deltaText(rirDelta)}
                        </Text>
                      </View>
                    </View>

                    {/* Tekrar & RIR sekans */}
                    <View style={styles.seqRow}>
                      <View style={styles.seqItem}>
                        <Text style={styles.seqLabel}>Tekrar</Text>
                        <Text style={styles.seqValues}>
                          {repsValues.join(" → ")}
                        </Text>
                      </View>
                      <View style={styles.seqItem}>
                        <Text style={styles.seqLabel}>RIR</Text>
                        <Text style={styles.seqValues}>
                          {rirValues.join(" → ")}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </>
      )}
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
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: { padding: 4 },
  backText: { color: "#fff", fontSize: 24, fontWeight: "300" },
  title: { color: "#fff", fontSize: 20, fontWeight: "800" },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    color: "#e5e7eb",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  pillScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  pillContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  pillText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#000",
  },

  list: { flex: 1 },
  listContent: {
    padding: 20,
    gap: 16,
  },

  card: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 20,
    padding: 18,
    overflow: "hidden",
  },
  exName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  chartLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  chartWrap: {
    marginLeft: -18,
    marginRight: -18,
    overflow: "hidden",
  },
  chart: {
    borderRadius: 0,
  },

  deltaRow: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
  },
  deltaItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 4,
  },
  deltaDivider: {
    width: 1,
    backgroundColor: "#1a1a1a",
  },
  deltaLabel: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  deltaValue: {
    fontSize: 16,
    fontWeight: "900",
  },

  seqRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  seqItem: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  seqLabel: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  seqValues: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
});
