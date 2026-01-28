console.log("script-game.js cargado correctamente");

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { onSnapshot } from
"https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { app } from "../../firebase.js";

const db = getFirestore(app);

// =======================
// ESPERAR AL DOM
// =======================
document.addEventListener("DOMContentLoaded", () => {
  crearPanelNumeros();
  iniciarJuego();
  escucharJuego();
});

// =======================
// OBTENER USUARIO DE URL
// =======================
function getCurrentUser() {
  const params = new URLSearchParams(window.location.search);
  return params.get("user");
}

// =======================
// GENERAR CARTÓN BINGO
// =======================
function generarCarton() {
  const ranges = [
    [1, 9], [10, 19], [20, 29], [30, 39],
    [40, 49]
  ];

  let card = Array.from({ length: 3 }, () => Array(9).fill(null));
  let used = new Set();

  for (let col = 0; col < 9; col++) {
    let nums = [];
    while (nums.length < 2) {
      const n = Math.floor(Math.random() * (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0];
      if (!used.has(n)) {
        used.add(n);
        nums.push(n);
      }
    }

    nums.forEach(n => {
      let row;
      do {
        row = Math.floor(Math.random() * 3);
      } while (card[row][col] !== null);
      card[row][col] = n;
    });
  }

  card.forEach(row => {
    while (row.filter(n => n !== null).length > 5) {
      row[Math.floor(Math.random() * 9)] = null;
    }
  });

  return {
    f1: card[0],
    f2: card[1],
    f3: card[2]
  };
}

// =======================
// PINTAR CARTONES
// =======================
function pintarCartones(cartones, marcados = {}) {
  const cont = document.getElementById("cartones-container");
  cont.innerHTML = "";

  cartones.forEach((carton, ci) => {
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

// =======================
// INICIAR JUEGO
// =======================
async function iniciarJuego() {
  try {
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

    const data = snap.data();

    const nameEl = document.getElementById("player-name");
    if (nameEl) {
      nameEl.textContent = `Jugador: ${data.username}`;
    }

    // Si ya existen cartones, usarlos
    if (Array.isArray(data.cartones) && data.cartones.length > 0) {
      pintarCartones(data.cartones);
      return;
    }

    // Generar cartones según numCartones
    const cantidad = Number(data.numCartones) || 0;
    if (cantidad <= 0) {
      alert("No tienes cartones asignados");
      return;
    }

    const cartones = [];
    for (let i = 0; i < cantidad; i++) {
      cartones.push(generarCarton());
    }

    // Guardar cartones para que no cambien
    await setDoc(userRef, { cartones }, { merge: true });

    pintarCartones(cartones);

  } catch (err) {
    console.error("🔥 Error en iniciarJuego:", err);
  }
}

function escucharJuego() {
  onSnapshot(doc(db, "game", "gameState"), snap => {
    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("numero-cantado").textContent =
      data.numeroActual || "";

    (data.numerosSalidos || []).forEach(n => {
      const el = document.getElementById(`num-${n}`);
      if (el) el.classList.add("tachado");
    });
  });
}