// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDAEkZixmUKcjeXfrLEBG_QRVmT_yYFCyw",
  authDomain: "bingo-aa885.firebaseapp.com",
  databaseURL: "https://bingo-aa885-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bingo-aa885",
  storageBucket: "bingo-aa885.appspot.com",
  messagingSenderId: "635412875278",
  appId: "1:635412875278:web:243d8c6bf139fa8d82545f"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);

// Realtime Database
export const db = getDatabase(app);
