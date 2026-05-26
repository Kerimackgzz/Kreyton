import { BlurView } from "expo-blur";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HERO_IMAGE = require("../assets/images/fitness/heroGirisGorsel.jpg");

const TR_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatTurkishDate(d: Date) {
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${TR_DAYS[d.getDay()]}`;
}

export default function FitnessScreen() {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(formatTurkishDate(new Date()));
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <Image source={HERO_IMAGE} style={styles.bg} resizeMode="cover" />
      <View style={styles.overlay} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>

      <View style={styles.buttonsArea}>
        <Text style={styles.heroTitle}>FITNESS</Text>
        <GlassButton label="Antrenman Programı" onPress={() => router.push("/antrenman")} />
        <GlassButton label="İlerleyiş İstatistikleri" onPress={() => router.push("/ilerleme")} />
      </View>
    </View>
  );
}

function GlassButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  if (Platform.OS === "ios") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
        style={styles.glassWrap}
      >
        <BlurView intensity={30} tint="light" style={styles.blurBtn}>
          <Text style={[styles.btnLabel, disabled && styles.btnLabelDisabled]}>{label}</Text>
          {!disabled && <Text style={styles.btnArrow}>→</Text>}
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      style={[styles.glassWrap, styles.androidBtn, disabled && styles.androidBtnDisabled]}
    >
      <Text style={[styles.btnLabel, disabled && styles.btnLabelDisabled]}>{label}</Text>
      {!disabled && <Text style={styles.btnArrow}>→</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
  },
  dateText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 6,
    marginBottom: 20,
    opacity: 0.6,
  },
  buttonsArea: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
  },
  glassWrap: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  blurBtn: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  androidBtn: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  androidBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  btnLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  btnLabelDisabled: {
    opacity: 0.4,
  },
  btnArrow: {
    color: "#fff",
    fontSize: 18,
    opacity: 0.7,
  },
});
