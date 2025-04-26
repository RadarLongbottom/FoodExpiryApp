import React, { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { Text, Button, Divider, Switch } from "react-native-paper";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [wastedValue, setWastedValue] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || "Użytkowniku");
          } else {
            setName("Użytkowniku");
          }
        }
      } catch (error) {
        console.log("Błąd pobierania danych użytkownika:", error);
        setName("Użytkowniku");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const productsRef = collection(db, "users", user.uid, "products");
    const q = query(productsRef, orderBy("expiryDate"), limit(30));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const result = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const expiry = new Date(data.expiryDate);
          const diff = (expiry - now) / (1000 * 60 * 60 * 24);
          const dateStatus = diff < 0 ? "expired" : diff <= 7 ? "soon" : "ok";
          return {
            id: doc.id,
            name: data.name,
            category: data.category,
            expiryDate: expiry.toLocaleDateString(),
            status: data.status || "ok",
            dateStatus,
          };
        })
        .filter((item) => item.status === "ok")
        .slice(0, 10);

      setProducts(result);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchWastedValue = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const productsRef = collection(db, "users", user.uid, "products");
      const q = query(productsRef, where("status", "==", "wasted"));
      const snapshot = await getDocs(q);

      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.price) total += data.price;
      });

      setWastedValue(total);
    };

    fetchWastedValue();
  }, [products]);

  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  const getColor = (dateStatus) => {
    switch (dateStatus) {
      case "expired":
        return "red";
      case "soon":
        return "orange";
      default:
        return undefined;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ textAlign: "center" }}>
          Ładowanie danych użytkownika...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text
        variant="headlineMedium"
        style={{ textAlign: "center", marginBottom: 20 }}
      >
        Witaj, {name}! 👋
      </Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddProduct")}
        style={{ marginBottom: 10 }}
      >
        ➕ Dodaj produkt
      </Button>

      <Divider style={{ marginVertical: 10 }} />

      <Text variant="titleMedium" style={{ marginBottom: 10 }}>
        Produkty z najbliższą datą:
      </Text>

      {products.length === 0 ? (
        <Text style={{ fontStyle: "italic", color: "#888" }}>
          Brak aktywnych produktów.
        </Text>
      ) : (
        products.map((item) => (
          <View
            key={item.id}
            style={{
              marginBottom: 8,
              padding: 10,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
          >
            <Text
              style={{ fontWeight: "bold", color: getColor(item.dateStatus) }}
            >
              {item.name} ({item.category})
            </Text>
            <Text style={{ color: getColor(item.dateStatus) }}>
              Ważne do: {item.expiryDate}
            </Text>
          </View>
        ))
      )}

      <Divider style={{ marginVertical: 10 }} />

      <Text style={{ marginBottom: 10 }}>
        ❌ Wyrzucono jedzenie za:{" "}
        <Text style={{ fontWeight: "bold", color: "darkred" }}>
          {wastedValue.toFixed(2)} zł
        </Text>
      </Text>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate("ProductList")}
        style={{ marginTop: 10 }}
      >
        Zobacz wszystkie produkty
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate("UsedAndWasted")}
        style={{ marginTop: 10 }}
      >
        📚 Zobacz historię produktów
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate("Statistics")}
        style={{ marginTop: 10 }}
      >
        📊 Statystyki
      </Button>
      <Button mode="text" onPress={handleLogout} style={{ marginTop: 10 }}>
        Wyloguj się
      </Button>
    </ScrollView>
  );
};

export default HomeScreen;
