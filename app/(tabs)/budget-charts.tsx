import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";

type Expense = {
  id: string;
  title: string;
  price: number;
  category: string;
  note: string;
  date: string;
};

type ChartEntry = {
  category: string;
  amount: number;
  color: string;
};

const COLORS: Record<string, string> = {
  Market: "#60a5fa",
  Yemek: "#fb7185",
  Ulaşım: "#fbbf24",
  Spor: "#34d399",
  Diğer: "#a78bfa",
};

const DONUT = { size: 196, stroke: 20 };
const RADIUS = (DONUT.size - DONUT.stroke) / 2;
const CIRC = 2 * Math.PI * RADIUS;

function buildChartData(expenses: Expense[]): ChartEntry[] {
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.price;
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      color: COLORS[category] ?? "#94a3b8",
    }))
    .sort((a, b) => b.amount - a.amount);
}

function DonutChart({ data, total }: { data: ChartEntry[]; total: number }) {
  let cum = 0;
  return (
    <View style={donutStyles.wrap}>
      <Svg width={DONUT.size} height={DONUT.size}>
        <G transform={`rotate(-90, ${DONUT.size / 2}, ${DONUT.size / 2})`}>
          <Circle
            cx={DONUT.size / 2}
            cy={DONUT.size / 2}
            r={RADIUS}
            stroke="#1e2a3a"
            strokeWidth={DONUT.stroke}
            fill="none"
          />
          {data.map((item) => {
            const pct = total > 0 ? item.amount / total : 0;
            const segLen = pct * CIRC;
            const offset = cum * CIRC;
            cum += pct;
            return (
              <Circle
                key={item.category}
                cx={DONUT.size / 2}
                cy={DONUT.size / 2}
                r={RADIUS}
                stroke={item.color}
                strokeWidth={DONUT.stroke}
                fill="none"
                strokeDasharray={[segLen - 3, CIRC - segLen + 3]}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
          })}
        </G>
        <SvgText
          x={DONUT.size / 2}
          y={DONUT.size / 2 - 10}
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="20"
          fontWeight="900"
        >
          {total.toFixed(0)} ₺
        </SvgText>
        <SvgText
          x={DONUT.size / 2}
          y={DONUT.size / 2 + 14}
          textAnchor="middle"
          fill="#475569"
          fontSize="11"
          fontWeight="700"
        >
          TOPLAM
        </SvgText>
      </Svg>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  wrap: { alignItems: "center", marginVertical: 8 },
});

export default function BudgetChartsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [tab, setTab] = useState<"day" | "month">("day");
  const [ready, setReady] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const blurAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    AsyncStorage.getItem("expenses").then((raw) => {
      if (raw) setExpenses(JSON.parse(raw));
      setTimeout(() => {
        setReady(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 680,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 680,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(blurAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      }, 380);
    });
  }, []);

  const today = new Date();
  const todayExpenses = expenses.filter(
    (e) => new Date(e.date).toDateString() === today.toDateString()
  );
  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });

  const activeExpenses = tab === "day" ? todayExpenses : monthlyExpenses;
  const chartData = buildChartData(activeExpenses);
  const total = activeExpenses.reduce((s, e) => s + e.price, 0);

  const todayTotal = todayExpenses.reduce((s, e) => s + e.price, 0);
  const monthTotal = monthlyExpenses.reduce((s, e) => s + e.price, 0);
  const dailyAvg = today.getDate() > 0 ? monthTotal / today.getDate() : 0;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Harcama Analizi</Text>
            <Text style={styles.subtitle}>Kategori dağılım raporu</Text>
          </View>
        </View>

        {/* Stat Cards */}
        {!ready ? (
          <View style={styles.skeletonRow}>
            <View style={styles.skeleton} />
            <View style={styles.skeleton} />
            <View style={styles.skeleton} />
          </View>
        ) : (
          <Animated.View
            style={[
              styles.statRow,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={[styles.statCard, { flex: 1.1 }]}>
              <Text style={styles.statLabel}>Bugün</Text>
              <Text style={styles.statValue}>{todayTotal.toFixed(0)} ₺</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Bu Ay</Text>
              <Text style={styles.statValue}>{monthTotal.toFixed(0)} ₺</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Günlük Ort.</Text>
              <Text style={styles.statValue}>{dailyAvg.toFixed(0)} ₺</Text>
            </View>
          </Animated.View>
        )}

        {/* Tab Toggle */}
        {ready && (
          <Animated.View style={[styles.tabWrap, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "day" && styles.tabBtnActive]}
              onPress={() => setTab("day")}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === "day" && styles.tabTextActive]}>
                Bugün
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === "month" && styles.tabBtnActive]}
              onPress={() => setTab("month")}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === "month" && styles.tabTextActive]}>
                Bu Ay
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Chart Card */}
        {ready && (
          <Animated.View
            style={[
              styles.chartCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {chartData.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  {tab === "day"
                    ? "Bugün henüz harcama yok."
                    : "Bu ay henüz harcama yok."}
                </Text>
              </View>
            ) : (
              <>
                <DonutChart data={chartData} total={total} />

                {/* Grid Legend */}
                <View style={styles.grid}>
                  {chartData.map((item) => (
                    <View key={item.category} style={styles.gridItem}>
                      <View
                        style={[styles.gridDot, { backgroundColor: item.color }]}
                      />
                      <Text style={styles.gridCat}>{item.category}</Text>
                      <Text style={styles.gridAmount}>{item.amount.toFixed(0)} ₺</Text>
                      <Text style={styles.gridPct}>
                        %{total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        )}

        {/* Skeleton chart */}
        {!ready && (
          <View style={styles.skeletonBig}>
            <View style={styles.skeletonCircle} />
            <View style={styles.skeletonLines}>
              <View style={[styles.skeletonLine, { width: "60%" }]} />
              <View style={[styles.skeletonLine, { width: "80%" }]} />
              <View style={[styles.skeletonLine, { width: "50%" }]} />
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Blur loading overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.blurLayer, { opacity: blurAnim }]}
      >
        <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#080c14",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 64,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },
  backBtn: { padding: 4 },
  backText: { color: "#fff", fontSize: 24, fontWeight: "300" },
  title: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#0f1623",
    borderWidth: 1,
    borderColor: "#1a2235",
    borderRadius: 18,
    padding: 16,
  },
  statLabel: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  tabWrap: {
    flexDirection: "row",
    backgroundColor: "#0f1623",
    borderWidth: 1,
    borderColor: "#1a2235",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#1e2a3a",
  },
  tabText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#f8fafc",
  },
  chartCard: {
    backgroundColor: "#0f1623",
    borderWidth: 1,
    borderColor: "#1a2235",
    borderRadius: 24,
    padding: 20,
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  gridItem: {
    width: "47.5%",
    backgroundColor: "#0b1120",
    borderWidth: 1,
    borderColor: "#1a2235",
    borderRadius: 16,
    padding: 14,
  },
  gridDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginBottom: 10,
  },
  gridCat: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  gridAmount: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  gridPct: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  skeleton: {
    flex: 1,
    height: 80,
    backgroundColor: "#0f1623",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1a2235",
    opacity: 0.6,
  },
  skeletonBig: {
    backgroundColor: "#0f1623",
    borderWidth: 1,
    borderColor: "#1a2235",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 20,
  },
  skeletonCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#1a2235",
  },
  skeletonLines: {
    width: "100%",
    gap: 10,
    alignItems: "center",
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#1a2235",
    borderRadius: 99,
  },
});
