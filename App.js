import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, Text } from "react-native-paper";
import { AuthProvider, AuthContext } from "./AuthContext";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductFormScreen from "./screens/ProductFormScreen";
import ProductListScreen from "./screens/ProductListScreen";
import UsedAndWastedScreen from "./screens/UsedAndWastedProducts";
import StatisticsScreen from "./screens/StatisticsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}

const MainNavigator = () => {
  const { user, loading, registering } = useContext(AuthContext);

  if (loading) {
    return <Text style={{ marginTop: 100, textAlign: "center" }}>Ładowanie...</Text>;
  }

  return (
    <Stack.Navigator>
      {!user || registering ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Logowanie" }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Rejestracja" }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddProduct" component={ProductFormScreen} options={{ title: "Dodaj produkt" }} />
          <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: "Wszystkie produkty" }} />
          <Stack.Screen name="UsedAndWasted" component={UsedAndWastedScreen} options={{ title: "Historia" }} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} options={{ title: "Statystyki" }} />
        </>
      )}
    </Stack.Navigator>
  );
};
