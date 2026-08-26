// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwA1sXfBD4ChYmtDOoda2FXRg-T0MdxAQ",
  authDomain: "nextcrm-demo-pizzeria.firebaseapp.com",
  projectId: "nextcrm-demo-pizzeria",
  storageBucket: "nextcrm-demo-pizzeria.firebasestorage.app",
  messagingSenderId: "667477719335",
  appId: "1:667477719335:web:a77f425ddb7463bfca5102"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);