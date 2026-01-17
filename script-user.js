import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);
let currentUser = null;

window.entrar = async function () {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Introduce un nombre de usuario");
    return;
  }

  currentUser = username;

  // El usuario entra SIN cartones (los asigna el admin)
  await setDoc(doc(db, "players", username), {
    username,
    numCartones: 0,
    dineroPorCarton: 50000,
    estado: "espera"
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("waiting").style.display = "block";

  escucharAsignacion();
};

function escucharAsignacion() {
  const ref = doc(db, "players", currentUser);

  onSnapshot(ref, snap => {
    if (!snap.exists()) return;

    const data = snap.data();

    if (data.numCartones > 0 && data.estado === "jugando") {
      document.getElementById("waiting").style.display = "none";
      document.getElementById("game").style.display = "block";

      document.getElementById("info").innerText =
        `Tienes ${data.numCartones} cartón(es)`;
    }
  });
}

window.cantarLinea = () => {
  alert("Has cantado LÍNEA (pendiente de validación)");
};

window.cantarBingo = () => {
  alert("Has cantado BINGO (pendiente de validación)");
};
