import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Expense = {
  id: string;
  title: string;
  price: number;
  category: string;
  note: string;
  date: string;
};

const categoryColors: Record<string, string> = {
  Market: "#2F80ED",
  Yemek: "#C93A3A",
  Ulaşım: "#F4B63F",
  Spor: "#2E7D32",
  Diğer: "#6D28D9",
};

export default function BudgetScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const loadExpenses = async () => {
    const storedExpenses = await AsyncStorage.getItem("expenses");
    const parsedExpenses = storedExpenses ? JSON.parse(storedExpenses) : [];
    setExpenses(parsedExpenses);
  };

  const deleteExpense = async (expenseId: string) => {
    const updatedExpenses = expenses.filter(
      (expense) => expense.id !== expenseId
    );

    await AsyncStorage.setItem("expenses", JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
  };

  const today = new Date();

  const todayExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate.toDateString() === today.toDateString();
  });

  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear()
    );
  });

  const todayTotal = todayExpenses.reduce((total, item) => total + item.price, 0);

  const monthlyTotal = monthlyExpenses.reduce(
    (total, item) => total + item.price,
    0
  );

  const dailyAverage = monthlyTotal / today.getDate();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Günlük Bütçe</Text>
      <Text style={styles.subtitle}>Harcama dashboard ekranı</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Bugün</Text>
          <Text style={styles.cardValue}>{todayTotal.toFixed(0)} TL</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardLabel}>Bu Ay</Text>
          <Text style={styles.cardValue}>{monthlyTotal.toFixed(0)} TL</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Aylık Ortalama</Text>
        <Text style={styles.averageValue}>{dailyAverage.toFixed(0)} TL</Text>
        <Text style={styles.panelText}>
          Bu ay günlük ortalama harcama miktarın.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Harcama Ekle</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/add-expense")}
        >
          <Text style={styles.buttonText}>Yeni Harcama Gir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Grafikler</Text>
        <Text style={styles.panelText}>
          Günlük ve aylık kategori dağılımlarını pasta grafikle görüntüle.
        </Text>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => router.push("/budget-charts")}
        >
          <Text style={styles.outlineButtonText}>Grafikleri Gör</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Bugünkü Harcamalar</Text>

        {todayExpenses.length === 0 ? (
          <Text style={styles.emptyText}>Henüz harcama eklenmedi.</Text>
        ) : (
          todayExpenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseLeft}>
                <View
                  style={[
                    styles.categoryDot,
                    {
                      backgroundColor:
                        categoryColors[expense.category] || "#64748b",
                    },
                  ]}
                />

                <View>
                  <Text style={styles.expenseTitle}>{expense.title}</Text>
                  <Text style={styles.expenseCategory}>{expense.category}</Text>
                </View>
              </View>

              <View style={styles.expenseRight}>
                <Text style={styles.expensePrice}>
                  {expense.price.toFixed(0)} TL
                </Text>

                <View style={styles.expenseRight}>
  <Text style={styles.expensePrice}>
    {expense.price.toFixed(0)} TL
  </Text>

  <View style={styles.actionRow}>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() =>
        router.push({
          pathname: "/edit-expense",
          params: { id: expense.id },
        })
      }
    >
      <Text style={styles.editButtonText}>Düzenle</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteExpense(expense.id)}
    >
      <Text style={styles.deleteButtonText}>Sil</Text>
    </TouchableOpacity>
  </View>
</View>
              </View>
            </View>
          ))
        )}
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
    fontSize: 34,
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
  panel: {
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  panelTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },
  panelText: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
    fontWeight: "600",
  },
  averageValue: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#2F80ED",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#2F80ED",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#2F80ED",
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  expenseItem: {
    backgroundColor: "#0b1120",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 99,
  },
  expenseTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  expenseCategory: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700",
  },
  expenseRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  expensePrice: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  deleteButton: {
    backgroundColor: "#C93A3A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  actionRow: {
  flexDirection: "row",
  gap: 8,
},

editButton: {
  backgroundColor: "#2F80ED",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 999,
},

editButtonText: {
  color: "#ffffff",
  fontSize: 12,
  fontWeight: "900",
},
});