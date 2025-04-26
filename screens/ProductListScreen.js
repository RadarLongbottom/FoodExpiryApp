import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { TextInput, Text, Button, Chip } from "react-native-paper";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const CATEGORIES = [
  "Wszystkie",
  "🧀 Nabiał",
  "🍖 Mięso",
  "🥦 Warzywa",
  "🍎 Owoce",
  "🍞 Pieczywo",
  "🍫 Słodycze",
  "🥨 Przekąski",
  "🧂 Produkty suche",
  "🍲 Gotowe dania",
  "🧃 Napoje",
  "🧴 Artykuły kuchenne",
  "🍺 Alkohol",
  "🧂 Przyprawy",
  "❄️ Mrożonki",
  "🧼 Chemia",
  "🛍️ Inne",
];

const ProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
  const [sortAsc, setSortAsc] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const productsRef = collection(db, "users", user.uid, "products");

    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const now = new Date();
      const items = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const expiry = new Date(data.expiryDate);
        const diff = (expiry - now) / (1000 * 60 * 60 * 24);
        let dateStatus = "ok";
        if (diff < 0) dateStatus = "expired";
        else if (diff <= 7) dateStatus = "soon";

        return {
          id: docSnap.id,
          name: data.name,
          category: data.category,
          price: data.price || 0,
          quantity: data.quantity || 1,
          expiryDate: expiry,
          status: data.status || "ok",
          dateStatus,
        };
      });

      setProducts(items);
    });

    return () => unsubscribe();
  }, []);

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

  const markUsed = async (id, quantity) => {
    const user = auth.currentUser;
    const ref = doc(db, "users", user.uid, "products", id);

    if (quantity <= 1) {
      await updateDoc(ref, { status: "used", quantity: 0 });
    } else {
      await updateDoc(ref, { quantity: quantity - 1 });
    }
  };

  const markWasted = async (id, quantity) => {
    const user = auth.currentUser;
    const ref = doc(db, "users", user.uid, "products", id);

    if (quantity <= 1) {
      await updateDoc(ref, { status: "wasted", quantity: 0 });
    } else {
      await updateDoc(ref, { quantity: quantity - 1 });
    }
  };

  const adjustQuantity = async (id, currentQty, change) => {
    const newQty = currentQty + change;
    const user = auth.currentUser;
    const ref = doc(db, "users", user.uid, "products", id);

    if (newQty <= 0) {
      await updateDoc(ref, { status: "used", quantity: 0 });
    } else {
      await updateDoc(ref, { quantity: newQty });
    }
  };

  const filtered = products
    .filter((p) => p.status === "ok")
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => selectedCategory === "Wszystkie" || p.category === selectedCategory)
    .sort((a, b) => (sortAsc ? a.expiryDate - b.expiryDate : b.expiryDate - a.expiryDate));

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 10 }}>
        Wszystkie aktywne produkty
      </Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddProduct")}
        style={{ marginBottom: 10 }}
      >
        ➕ Dodaj produkt
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate("UsedAndWasted")}
        style={{ marginBottom: 20 }}
      >
        📚 Zobacz historię produktów
      </Button>

      <TextInput
        label="Szukaj po nazwie"
        value={search}
        onChangeText={setSearch}
        style={{ marginBottom: 10 }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
            style={{ marginRight: 8 }}
          >
            {cat}
          </Chip>
        ))}
      </ScrollView>

      <Button
        mode="outlined"
        onPress={() => setSortAsc(!sortAsc)}
        style={{ marginBottom: 10 }}
      >
        Sortuj wg daty: {sortAsc ? "rosnąco ↑" : "malejąco ↓"}
      </Button>

      {filtered.length === 0 ? (
        <Text style={{ fontStyle: "italic", color: "#888" }}>
          Brak aktywnych produktów.
        </Text>
      ) : (
        filtered.map((item) => {
          const unitPrice = item.price || 0;
          const totalPrice = unitPrice * item.quantity;

          return (
            <View
              key={item.id}
              style={{
                marginBottom: 10,
                backgroundColor: "#f2f2f2",
                padding: 12,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontWeight: "bold", color: getColor(item.dateStatus) }}>
                {item.name} ({item.category})
              </Text>
              <Text style={{ color: getColor(item.dateStatus) }}>
                Ważne do: {item.expiryDate.toLocaleDateString()}
              </Text>
              <Text>Ilość: {item.quantity}</Text>
              <Text style={{ marginBottom: 6 }}>
                Cena: {unitPrice.toFixed(2)} zł ({totalPrice.toFixed(2)} zł)
              </Text>

              <View style={{ flexDirection: "row", marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                <Button compact mode="outlined" onPress={() => adjustQuantity(item.id, item.quantity, -1)}>
                  ➖
                </Button>
                <Button compact mode="outlined" onPress={() => adjustQuantity(item.id, item.quantity, 1)} style={{ marginLeft: 6 }}>
                  ➕
                </Button>
                <Button
                  compact
                  mode="outlined"
                  onPress={() => markUsed(item.id, item.quantity)}
                  style={{ marginLeft: 10 }}
                >
                  ✔️ Wykorzystano
                </Button>
                <Button
                  compact
                  mode="outlined"
                  textColor="red"
                  onPress={() => markWasted(item.id, item.quantity)}
                  style={{ marginLeft: 10 }}
                >
                  ❌ Wyrzucono
                </Button>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

export default ProductListScreen;
