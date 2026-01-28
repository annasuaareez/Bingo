import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { app } from "../../firebase.js";

const db = getFirestore(app);
let currentUser = "";

// Entrar al bingo
window.entrar = async function() {
  const user = document.getElementById("username").value.trim();
  if (!user) return alert("Introduce un nombre de usuario");

  currentUser = user.toLowerCase();
  const userRef = doc(db, "players", currentUser);
  const gameRef = doc(db, "game", "gameState");

  const gameSnap = await getDoc(gameRef);

  // Mostrar pantalla de espera
  document.getElementById("login-container").style.display = "none";
  const loading = document.getElementById("loading-container");
  const loadingMessage = document.getElementById("loading-message");
  loading.style.display = "block";

  // Guardar usuario si no existe
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      username: currentUser,
      numCartones: 0,
      estado: "espera"
    });
  } else {
    await setDoc(userRef, { estado: "espera" }, { merge: true });
  }

  // Mostrar mensaje según estado global de la partida
  if (gameSnap.exists() && gameSnap.data().estado === "jugando") {
    loadingMessage.textContent = "Partida ya en curso. Espera turno o próximos juegos.";
  } else {
    loadingMessage.textContent = "Esperando a que el administrador inicie la partida";
  }

  // Escuchar cambios globales del juego
  onSnapshot(gameRef, async (docSnap) => {
    const data = docSnap.data();
    if (!data) return;

    if (data.estado === "jugando") {
      // Actualizar a jugando solo si entró antes
      const playerSnap = await getDoc(userRef);
      if (playerSnap.exists() && playerSnap.data().estado === "espera") {
        await updateDoc(userRef, { estado: "jugando" });
      }
      loadingMessage.textContent = "Partida iniciada. ¡Buena suerte!";
    } else if (data.estado === "finalizado") {
      loadingMessage.textContent = "La partida ha terminado";
    }
  });

  // Escuchar cambios de su propio estado
  onSnapshot(userRef, (docSnap) => {
    const data = docSnap.data();
    if (!data) return;

    if (data.estado === "jugando") {
      loading.style.display = "none";
      window.location.href = `game.html?user=${currentUser}`;
    }
  });
};
