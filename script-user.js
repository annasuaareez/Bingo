import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);
let currentUser = "";

// Entrar
window.entrar = async function() {
  const user = document.getElementById("username").value.trim();
  if (!user) return alert("Introduce un nombre de usuario");

  currentUser = user.toLowerCase();

  // Guardar usuario en Firestore si no existe
  const userRef = doc(db, "players", currentUser);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      username: currentUser,
      numCartones: 0,
      estado: "espera",
      cartones: []
    });
  }

  // Mostrar loader
  document.getElementById("login-container").style.display = "none";
  document.getElementById("loading-container").style.display = "block";

  // Escuchar cambios
  onSnapshot(userRef, docSnap => {
    const data = docSnap.data();
    if (!data) return;

    // ✅ REDIRECCIONAR SOLO CON ESTADO "jugando"
    if (data.estado === "jugando") {
      window.location = `game.html?user=${currentUser}`;
    }
  });
};
