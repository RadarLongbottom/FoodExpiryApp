// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore"; // UWAGA: zmiana!

const firebaseConfig = {
  apiKey: "AIzaSyDL6cVYcPg86Xt05AwgGhiH6PIikbcQ5_c",
  authDomain: "foodexpiryapp-b598f.firebaseapp.com",
  projectId: "foodexpiryapp-b598f",
  storageBucket: "foodexpiryapp-b598f.firebasestorage.app",
  messagingSenderId: "167126456528",
  appId: "1:167126456528:web:003b25d6834f0f00ad66d5",
  measurementId: "G-4902WQ4YMW"
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Uwierzytelnianie
export const auth = getAuth(app);

// Firestore z wymuszeniem długiego pollingu (rozwiązuje problemy z siecią)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
