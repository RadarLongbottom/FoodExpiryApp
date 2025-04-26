import React, { useEffect, useState } from "react";
import { ScrollView, View, Text as RNText } from "react-native";
import { Text } from "react-native-paper";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const UsedAndWastedScreen = () => {
  const [used, setUsed] = useState([]);
  const [wasted, setWasted] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const productsRef = collection(db, "users", user.uid, "products");

    const qUsed = query(productsRef, where("status", "==", "used"));
    const qWasted = query(productsRef, where("status", "==", "wasted"));

    const unsubUsed = onSnapshot(qUsed, (snapshot) => {
      const result = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: new Date(doc.data().expiryDate),
      }));
      setUsed(result);
    });

    const unsubWasted = onSnapshot(qWasted, (snapshot) => {
      const result = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: new Date(doc.data().expiryDate),
      }));
      setWasted(result);
    });

    return () => {
      unsubUsed();
      unsubWasted();
    };
  }, []);

  const renderItem = (item, color) => (
    <View
      key={item.id}
      style={{
        backgroundColor: "#f2f2f2",
        marginBottom: 10,
        padding: 10,
        borderRadius: 6,
      }}
    >
      <Text style={{ fontWeight: "bold", color }}>{item.name} ({item.category})</Text>
      <Text style={{ color }}>Ważne do: {item.expiryDate.toLocaleDateString()}</Text>
      <Text>Cena: {item.price?.toFixed(2) || "—"} zł</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 10 }}>
        Historia produktów
      </Text>

      <View style={{ flexDirection: "row", gap: 16 }}>
        {/* Wykorzystane */}
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ marginBottom: 10, color: "green" }}>
            ✅ Wykorzystane
          </Text>
          {used.length === 0 ? (
            <RNText style={{ fontStyle: "italic", color: "#888" }}>
              Brak danych
            </RNText>
          ) : (
            used.map((item) => renderItem(item, "green"))
          )}
        </View>

        {/* Wyrzucone */}
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" style={{ marginBottom: 10, color: "darkred" }}>
            ❌ Wyrzucone
          </Text>
          {wasted.length === 0 ? (
            <RNText style={{ fontStyle: "italic", color: "#888" }}>
              Brak danych
            </RNText>
          ) : (
            wasted.map((item) => renderItem(item, "darkred"))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default UsedAndWastedScreen;
