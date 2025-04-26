import React, { useState, useContext } from "react";
import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../AuthContext";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();
  const { setRegistering } = useContext(AuthContext);

  const handleRegister = async () => {
    setError("");
    setSuccess(false);
    setRegistering(true); // blokujemy HomeScreen

    if (!name || !email || !password) {
      setError("Wszystkie pola są wymagane");
      setRegistering(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        name: name,
        email: email,
      });

      await signOut(auth); // wylogowanie po rejestracji
      setSuccess(true);
      setRegistering(false); // odblokuj nawigację

      setTimeout(() => {
        navigation.replace("Login");
      }, 2000);
    } catch (e) {
      console.log("Błąd rejestracji:", e);
      setError("Błąd rejestracji: " + e.message);
      setRegistering(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16, textAlign: "center" }}>
        Zarejestruj się
      </Text>

      <TextInput
        label="Imię"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ marginBottom: 10 }}
      />

      <TextInput
        label="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10 }}
      />

      {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}
      {success ? (
        <Text style={{ color: "green", marginBottom: 10 }}>
          Zarejestrowano pomyślnie! Przekierowywanie do logowania...
        </Text>
      ) : null}

      <Button mode="contained" onPress={handleRegister}>
        Zarejestruj się
      </Button>
    </View>
  );
};

export default RegisterScreen;
