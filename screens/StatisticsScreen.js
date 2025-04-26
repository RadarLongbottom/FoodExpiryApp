import React, { useEffect, useState } from "react";
import { ScrollView, View, Platform } from "react-native";
import { Text, Divider } from "react-native-paper";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import InteractivePieChart from "../components/InteractivePieChart";
import VictoryWebPieChart from "../components/VictoryWebPieChart";

const processData = (data) => {
  const counts = {};
  data.forEach((item) => {
    const cat = item.category || "Nieznana";
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const colors = [
    "#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6",
    "#1abc9c", "#e67e22", "#34495e", "#fd79a8", "#00cec9",
    "#6c5ce7", "#d63031", "#2d3436",
  ];

  return Object.keys(counts).map((category, index) => ({
    name: category,
    count: counts[category],
    color: colors[index % colors.length],
  }));
};

const StatisticsScreen = () => {
  const [usedData, setUsedData] = useState([]);
  const [wastedData, setWastedData] = useState([]);
  const [summary, setSummary] = useState({
    thisMonth: 0,
    used: 0,
    wasted: 0,
    wastedValue: 0,
    topWastedCategory: "-",
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = collection(db, "users", user.uid, "products");

    const unsubUsed = onSnapshot(query(ref, where("status", "==", "used")), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setUsedData(processData(data));
      setSummary((prev) => ({ ...prev, used: data.length }));
    });

    const unsubWasted = onSnapshot(query(ref, where("status", "==", "wasted")), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setWastedData(processData(data));

      const total = data.reduce((sum, item) => sum + (item.price || 0), 0);
      const categories = data.reduce((acc, item) => {
        const cat = item.category || "Nieznana";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

      setSummary((prev) => ({
        ...prev,
        wasted: data.length,
        wastedValue: total,
        topWastedCategory: topCategory,
      }));
    });

    const unsubAll = onSnapshot(ref, (snapshot) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const count = snapshot.docs.filter((doc) => {
        const createdAt = new Date(doc.data().createdAt);
        return createdAt.getMonth() === currentMonth;
      }).length;
      setSummary((prev) => ({ ...prev, thisMonth: count }));
    });

    return () => {
      unsubUsed();
      unsubWasted();
      unsubAll();
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 20, textAlign: "center" }}>
        📊 Statystyki produktów
      </Text>

      <View style={{
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}>
        <Text variant="titleMedium" style={{ marginBottom: 10 }}>
          🔥 Podsumowanie:
        </Text>
        <Divider style={{ marginBottom: 10 }} />
        <Text>📦 Produkty dodane w tym miesiącu: <Text style={{ fontWeight: "bold" }}>{summary.thisMonth}</Text></Text>
        <Text>✅ Produkty wykorzystane: <Text style={{ fontWeight: "bold" }}>{summary.used}</Text></Text>
        <Text>❌ Produkty wyrzucone: <Text style={{ fontWeight: "bold" }}>{summary.wasted}</Text></Text>
        <Text>💸 Wartość wyrzuconych: <Text style={{ fontWeight: "bold" }}>{summary.wastedValue.toFixed(2)} zł</Text></Text>
        <Text>📊 Najczęściej wyrzucana kategoria: <Text style={{ fontWeight: "bold" }}>{summary.topWastedCategory}</Text></Text>
      </View>

      <Text variant="titleMedium" style={{ marginBottom: 6 }}>
        🧾 Produkty wg kategorii
      </Text>

      {usedData.length === 0 && wastedData.length === 0 ? (
        <Text style={{ fontStyle: "italic", color: "#888", marginBottom: 20 }}>Brak danych.</Text>
      ) : Platform.OS === "web" ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 10,
          }}
        >
          <View style={{ alignItems: "center", marginHorizontal: 10 }}>
            <VictoryWebPieChart data={usedData} />
            <Text style={{ marginTop: 4 }}>✅ Wykorzystane</Text>
          </View>
          <View style={{ alignItems: "center", marginHorizontal: 10 }}>
            <VictoryWebPieChart data={wastedData} />
            <Text style={{ marginTop: 4 }}>❌ Wyrzucone</Text>
          </View>
        </View>
      ) : (
        <>
          <Text>✅ Wykorzystane</Text>
          <InteractivePieChart data={usedData} />
          <Text style={{ marginTop: 20 }}>❌ Wyrzucone</Text>
          <InteractivePieChart data={wastedData} />
        </>
      )}
    </ScrollView>
  );
};

export default StatisticsScreen;
