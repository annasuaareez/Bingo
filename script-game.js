import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);

// =======================
// OBTENER USUARIO DE URL
// =======================
const params = new URLSearchParams(window.location.search);
const currentUser = params.get("user");

if (!currentUser) {
  alert("Usuario no válido");
  throw new Error("No user");
}

// =======================
// GENERAR CARTÓN BINGO
// =======================
function generarCarton() {
  const ranges = [
    [1, 9],[10,19],[20,29],[30,39],
    [40,49],[50,59],[60,69],[70,79],[80,90]
  ];

  let card = Array.from({ length: 3 }, () => Array(9).fill(null));
  let used = new Set();

  for (let col = 0; col < 9; col++) {
    let nums = [];
    while (nums.length < 2) {
      let n = Math.floor(Math.random() * (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0];
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
  cont.innerHTML = "";

  cartones.forEach((carton, i) => {
    const div = document.createElement("div");
    div.className = "carton";

    div.innerHTML = `<h3>Cartón ${i + 1}</h3>`;

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
// CARGAR JUGADOR
// =======================
async function iniciarJuego() {
  const userRef = doc(db, "players", currentUser);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    alert("Jugador no encontrado");
    return;
  }

  const data = snap.data();
  document.getElementById("player-name").textContent =
    `Jugador: ${data.username}`;

  // 🔑 Si ya tiene cartones, usarlos
  if (data.cartones && data.cartones.length > 0) {
    pintarCartones(data.cartones);
    return;
  }

  // 🔥 Generar cartones según cantidad asignada
  const cartones = [];
  for (let i = 0; i < data.numCartones; i++) {
    cartones.push(generarCarton());
  }

  // Guardarlos para que no cambien
  await setDoc(userRef, { cartones }, { merge: true });

  pintarCartones(cartones);
}

iniciarJuego();
