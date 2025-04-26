import React, { useState } from "react";
import { View, Platform, Text as RNText } from "react-native";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  SegmentedButtons,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const categories = [
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

const ProductFormScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [quantity, setQuantity] = useState("1");

  const handleSubmit = async () => {
    if (!name || !price || !quantity) return;

    const user = auth.currentUser;
    if (!user) return;

    const productsRef = collection(db, "users", user.uid, "products");

    await addDoc(productsRef, {
      name,
      expiryDate: expiryDate.toISOString(),
      price: parseFloat(price),
      category: category.replace(/^[^\p{L}0-9]+/gu, "").trim(),
      quantity: parseInt(quantity),
      status: "ok",
      createdAt: new Date().toISOString(),
    });

    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        ➕ Dodaj nowy produkt
      </Text>

      <TextInput
        label="Nazwa produktu"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Cena (zł)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Ilość"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={{ marginBottom: 10 }}
      />
      <HelperText visible={parseInt(quantity) <= 0}>
        Ilość musi być większa od zera
      </HelperText>

      <SegmentedButtons
        value={category}
        onValueChange={setCategory}
        buttons={categories.map((cat) => ({
          value: cat,
          label: cat,
        }))}
        style={{ marginBottom: 10 }}
      />

      {Platform.OS === "web" ? (
        <View style={{ marginBottom: 10 }}>
          <RNText style={{ marginBottom: 4 }}>Data ważności:</RNText>
          <input
            type="date"
            value={expiryDate.toISOString().split("T")[0]}
            onChange={(e) => setExpiryDate(new Date(e.target.value))}
            style={{
              padding: 10,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#ccc",
              fontSize: 16,
            }}
          />
        </View>
      ) : (
        <>
          <Button
            mode="outlined"
            onPress={() => setShowPicker(true)}
            style={{ marginBottom: 10 }}
          >
            Wybierz datę ważności: {expiryDate.toLocaleDateString()}
          </Button>
          {showPicker && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setExpiryDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      <Button mode="contained" onPress={handleSubmit}>
        Dodaj produkt
      </Button>
    </View>
  );
};

export default ProductFormScreen;
