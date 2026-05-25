import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const dailyExpenses = [
  {
    name: "Yemek",
    amount: 380,
    color: "#C93A3A",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  {
    name: "Market",
    amount: 260,
    color: "#2F80ED",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  {
    name: "Ulaşım",
    amount: 180,
    color: "#F4B63F",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  {
    name: "Diğer",
    amount: 160,
    color: "#2E7D32",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  
];
const monthlyExpenses = [
  {
    name: "Yemek",
    amount: 3200,
    color: "#C93A3A",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  {
    name: "Market",
    amount: 2100,
    color: "#2F80ED",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  {
    name: "Ulaşım",
    amount: 1450,
    color: "#F4B63F",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
  {
    name: "Diğer",
    amount: 1900,
    color: "#2E7D32",
    legendFontColor: "#e5e7eb",
    legendFontSize: 13,
  },
];

const monthlyTotal = 8650;
const currentDayOfMonth = 25;
const dailyAverage = monthlyTotal / currentDayOfMonth;

export default function BudgetChartsScreen() {
  const [showData, setShowData] = useState(false);

  const pageOpacity = useRef(new Animated.Value(0)).current;
  const pageTranslate = useRef(new Animated.Value(28)).current;
  const chartScale = useRef(new Animated.Value(0.72)).current;
  const chartRotate = useRef(new Animated.Value(-10)).current;
  const blurOpacity = useRef(new Animated.Value(1)).current;

  const todayTotal = dailyExpenses.reduce((total, item) => total + item.amount, 0);
  const monthlyCategoryTotal = monthlyExpenses.reduce(
  (total, item) => total + item.amount,
  0
);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowData(true);

      Animated.parallel([
        Animated.timing(pageOpacity, {
          toValue: 1,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pageTranslate, {
          toValue: 0,
          duration: 750,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(chartScale, {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(chartRotate, {
          toValue: 0,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(blurOpacity, {
          toValue: 0,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const rotateValue = chartRotate.interpolate({
    inputRange: [-10, 0],
    outputRange: ["-10deg", "0deg"],
  });

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Harcama Grafikleri</Text>
        <Text style={styles.subtitle}>Günlük ve aylık harcama analizi</Text>

        {!showData && (
          <View>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonCard} />
              <View style={styles.skeletonCard} />
            </View>

            <View style={styles.skeletonBigCard}>
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonCircle} />
              <View style={styles.skeletonLineSmall} />
            </View>
          </View>
        )}

        {showData && (
          <Animated.View
            style={{
              opacity: pageOpacity,
              transform: [{ translateY: pageTranslate }],
            }}
          >
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.cardLabel}>Bugün Harcanan</Text>
                <Text style={styles.cardValue}>{todayTotal} TL</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.cardLabel}>Aylık Toplam</Text>
                <Text style={styles.cardValue}>{monthlyTotal} TL</Text>
              </View>
            </View>

            <View style={styles.bigCard}>
              <Text style={styles.sectionTitle}>Aylık Ortalama</Text>
              <Text style={styles.averageValue}>{dailyAverage.toFixed(0)} TL</Text>
              <Text style={styles.description}>
                Bu ay günlük ortalama harcama miktarın.
              </Text>
            </View>

            <View style={styles.bigCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Bugünkü Dağılım</Text>
                  <Text style={styles.miniText}>Kategori bazlı harcama oranı</Text>
                </View>

                <Text style={styles.totalBadge}>{todayTotal} TL</Text>
              </View>
              

              <Animated.View
                style={[
                  styles.chartWrapper,
                  {
                    transform: [
                      { scale: chartScale },
                      { rotate: rotateValue },
                    ],
                  },
                ]}
              >
                <PieChart
                  data={dailyExpenses}
                  width={screenWidth - 72}
                  height={230}
                  chartConfig={{
                    color: () => "#ffffff",
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="42"
                  center={[0, 0]}
                  absolute
                  hasLegend={false}
                />
              </Animated.View>

              <View style={styles.legendBox}>
                {dailyExpenses.map((item) => (
                  <View key={item.name} style={styles.legendRow}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.legendName}>{item.name}</Text>
                    </View>

                    <View style={styles.legendRight}>
                      <Text style={styles.legendAmount}>{item.amount} TL</Text>
                      <Text style={styles.legendPercent}>
                        %{((item.amount / todayTotal) * 100).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.bigCard}>
  <View style={styles.cardHeader}>
    <View>
      <Text style={styles.sectionTitle}>Aylık Dağılım</Text>
      <Text style={styles.miniText}>Bu ay kategori bazlı harcama oranı</Text>
    </View>

    <Text style={styles.totalBadge}>{monthlyCategoryTotal} TL</Text>
  </View>

  <Animated.View
    style={[
      styles.chartWrapper,
      {
        transform: [
          { scale: chartScale },
          { rotate: rotateValue },
        ],
      },
    ]}
  >
    <PieChart
      data={monthlyExpenses}
      width={screenWidth - 72}
      height={230}
      chartConfig={{
        color: () => "#ffffff",
      }}
      accessor="amount"
      backgroundColor="transparent"
      paddingLeft="42"
      center={[0, 0]}
      absolute
      hasLegend={false}
    />
  </Animated.View>

  <View style={styles.legendBox}>
    {monthlyExpenses.map((item) => (
      <View key={item.name} style={styles.legendRow}>
        <View style={styles.legendLeft}>
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendName}>{item.name}</Text>
        </View>

        <View style={styles.legendRight}>
          <Text style={styles.legendAmount}>{item.amount} TL</Text>
          <Text style={styles.legendPercent}>
            %{((item.amount / monthlyCategoryTotal) * 100).toFixed(0)}
          </Text>
        </View>
      </View>
    ))}
  </View>
</View>
          </Animated.View>
        )}
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[styles.blurLayer, { opacity: blurOpacity }]}
      >
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}



const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
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
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardLabel: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "700",
  },
  cardValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },
  bigCard: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  miniText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "700",
  },
  totalBadge: {
    color: "#ffffff",
    backgroundColor: "#1f2937",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "900",
  },
  averageValue: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8,
    marginBottom: 6,
  },
  description: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  chartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  legendBox: {
    marginTop: 10,
    gap: 10,
  },
  legendRow: {
    backgroundColor: "#0b1120",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 13,
    height: 13,
    borderRadius: 99,
  },
  legendName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
  legendRight: {
    alignItems: "flex-end",
  },
  legendAmount: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  legendPercent: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "800",
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  skeletonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  skeletonCard: {
    flex: 1,
    height: 96,
    backgroundColor: "#111827",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1f2937",
    opacity: 0.65,
  },
  skeletonBigCard: {
    height: 380,
    backgroundColor: "#111827",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 18,
    opacity: 0.65,
  },
  skeletonLine: {
    width: "55%",
    height: 18,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    marginBottom: 30,
  },
  skeletonCircle: {
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: "#1f2937",
    alignSelf: "center",
    marginBottom: 32,
  },
  skeletonLineSmall: {
    width: "80%",
    height: 16,
    backgroundColor: "#1f2937",
    borderRadius: 999,
    alignSelf: "center",
  },
  
});