console.log("script-game.js cargado correctamente");

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);

// =======================
// ESPERAR AL DOM
// =======================
document.addEventListener("DOMContentLoaded", () => {
  iniciarJuego();
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
    [40, 49], [50, 59], [60, 69], [70, 79], [80, 90]
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
function pintarCartones(cartones) {
  const cont = document.getElementById("cartones-container");

  if (!cont) {
    console.error("❌ No existe #cartones-container");
    return;
  }

  cont.innerHTML = "";

  cartones.forEach((carton, index) => {
    const div = document.createElement("div");
    div.className = "carton";

    const titulo = document.createElement("h3");
    titulo.textContent = `Cartón ${index + 1}`;
    div.appendChild(titulo);

    ["f1", "f2", "f3"].forEach(fila => {
      const row = document.createElement("div");
      row.className = "fila";

      carton[fila].forEach(num => {
        const cell = document.createElement("div");
        cell.className = "celda";
        cell.textContent = num ?? "";
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
