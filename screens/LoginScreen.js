import React, { useState, useContext } from "react";
import { View } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { AuthContext } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e) {
      setError("Błąd logowania: " + e.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text variant="titleLarge" style={{ marginBottom: 16, textAlign: "center" }}>
        Zaloguj się
      </Text>

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

      <Button mode="contained" onPress={handleLogin} style={{ marginBottom: 10 }}>
        Zaloguj się
      </Button>

      <Button
        mode="outlined"
        onPress={() => {
          navigation.navigate("Register");
        }}
      >
        Przejdź do rejestracji
      </Button>
    </View>
  );
};

export default LoginScreen;
