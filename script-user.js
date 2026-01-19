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

  // Guardar usuario en Firestore sin cartones todavía
  await setDoc(doc(db, "players", username), {
    username,
    numCartones: 0,
    estado: "espera",
    dineroPorCarton: 50000
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

      // Mostrar los cartones
      mostrarCartones(data.cartones);
    }
  });
}

function mostrarCartones(cartones) {
  const cont = document.getElementById("cards");
  cont.innerHTML = "";

  cartones.forEach(card => {
    const div = document.createElement("div");
    div.className = "bingo-card";

    card.flat().forEach(n => {
      const c = document.createElement("div");
      c.className = "cell";
      if (n === null) c.classList.add("empty");
      else c.textContent = n;

      c.addEventListener("click", () => c.classList.toggle("marked"));

      div.appendChild(c);
    });

    cont.appendChild(div);
  });
}

window.cantarLinea = () => alert("Has cantado LÍNEA (pendiente de validación)");
window.cantarBingo = () => alert("Has cantado BINGO (pendiente de validación)");
