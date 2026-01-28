import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { app } from "../../firebase.js";

const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  iniciarJugador();
  escucharJuego();
});

// ========================
// OBTENER USUARIO DE URL
// ========================
function getCurrentUser() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

// ========================
// INICIALIZAR JUGADOR
// ========================
async function iniciarJugador() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert("Usuario no válido");
    return;
  }

  const userRef = doc(db, "players", currentUser);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    alert("Jugador no encontrado");
    return;
  }

  // Mostrar nombre
  document.getElementById("player-name").textContent =
    `Jugador: ${snap.data().username}`;

  // Escuchar cambios del jugador en tiempo real
  escucharJugador(currentUser);
}

// ========================
// ESCUCHAR JUGADOR (CLAVE)
// ========================
function escucharJugador(username) {
  const userRef = doc(db, "players", username);

  onSnapshot(userRef, snap => {
    if (!snap.exists()) return;

    const data = snap.data();
    const cont = document.getElementById("cartones-container");

    // Esperando partida
    if (data.estado === "espera") {
      cont.innerHTML = "<p>Esperando a que el admin inicie la partida…</p>";
      return;
    }

    // Jugando → pintar cartones
    if (
      data.estado === "jugando" &&
      Array.isArray(data.cartones) &&
      data.cartones.length > 0
    ) {
      pintarCartones(data.cartones, data.marcados || {});
    }

    // Partida finalizada
    if (data.estado === "finalizado") {
      cont.innerHTML = "<p>La partida ha finalizado.</p>";
    }
  });
}

// ========================
// ESCUCHAR JUEGO (NÚMEROS)
// ========================
function escucharJuego() {
  const gameRef = doc(db, "game", "gameState");

  onSnapshot(gameRef, snap => {
    if (!snap.exists()) return;

    const data = snap.data();

    // Número actual
    document.getElementById("numero-cantado").textContent =
      data.numeroActual ?? "";

    // Marcar números salidos
    (data.numerosSalidos || []).forEach(n => {
      const el = document.getElementById(`num-${n}`);
      if (el) el.classList.add("tachado");
    });
  });
}

// ========================
// PINTAR CARTONES
// ========================
function pintarCartones(cartones, marcados = {}) {
  const cont = document.getElementById("cartones-container");
  cont.innerHTML = "";

  cartones.forEach(carton => {
    const div = document.createElement("div");
    div.className = "carton";

    ["f1", "f2", "f3"].forEach(fila => {
      const row = document.createElement("div");
      row.className = "fila";

      carton[fila].forEach(num => {
        const cell = document.createElement("div");

        if (num === null) {
          cell.className = "celda vacia";
        } else {
          cell.className = "celda";
          cell.textContent = num;

          if (marcados[num]) {
            cell.classList.add("marcada");
          }

          cell.addEventListener("click", async () => {
            const marcado = !marcados[num];
            marcados[num] = marcado;
            cell.classList.toggle("marcada", marcado);
            await guardarMarcados(marcados);
          });
        }

        row.appendChild(cell);
      });

      div.appendChild(row);
    });

    cont.appendChild(div);
  });
}

// ========================
// GUARDAR MARCADOS
// ========================
async function guardarMarcados(marcados) {
  const user = getCurrentUser();
  if (!user) return;

  const userRef = doc(db, "players", user);
  await updateDoc(userRef, { marcados });
}
