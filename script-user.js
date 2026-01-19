import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);
let currentUser = "";

// Entrar al bingo
window.entrar = async function() {
  const user = document.getElementById("username").value.trim();
  if (!user) return alert("Introduce un nombre de usuario");

  currentUser = user.toLowerCase();

  const userRef = doc(db, "players", currentUser);

  // Guardar usuario en Firestore si no existe
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      username: currentUser,
      numCartones: 0,
      estado: "espera",
      cartones: []
    });
  } else {
    // Si ya existía, aseguramos que esté en espera
    await setDoc(userRef, { estado: "espera" }, { merge: true });
  }

  // Mostrar pantalla de espera
  document.getElementById("login-container").style.display = "none";
  document.getElementById("loading-container").style.display = "block";

  // Escuchar cambios en tiempo real
  onSnapshot(userRef, (docSnap) => {
    const data = docSnap.data();
    if (!data) return;

    // 🔑 Si admin inició partida, redirigir inmediatamente
    if (data.estado === "jugando") {
      // ocultar loader antes de redirigir
      document.getElementById("loading-container").style.display = "none";
      // Redirigir a la página de juego con el usuario
      window.location.href = `game.html?user=${currentUser}`;
    }
  });
};
