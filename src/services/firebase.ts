// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApKbcla48V0wKJ8f8lZLGLA2ksLAvsR5E",
  authDomain: "cuoikidnt.firebaseapp.com",
  databaseURL:
    "https://cuoikidnt-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cuoikidnt",
  storageBucket: "cuoikidnt.firebasestorage.app",
  messagingSenderId: "153105022330",
  appId: "1:153105022330:web:91525fcd44745afbe36ac3",
  measurementId: "G-KP4FRP1K1T",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
