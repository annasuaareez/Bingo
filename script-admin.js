import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);

// Admins permitidos
const ADMINS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "admin123";

window.loginAdmin = async function () {
  const rawUser = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  const user = rawUser.trim().toLowerCase();

  if (!ADMINS.includes(user)) {
    alert("Usuario no autorizado");
    return;
  }

  if (pass !== ADMIN_PASS) {
    alert("Contraseña incorrecta");
    return;
  }

  // Guardar admin en Firestore
  await setDoc(doc(db, "admins", user), {
    username: user,
    conectado: true,
    lastLogin: serverTimestamp()
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("panel").style.display = "block";

  escucharJugadores();
};

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
      do { row = Math.floor(Math.random() * 3); } while (card[row][col] !== null);
      card[row][col] = n;
    });
  }

  card.forEach(row => {
    while (row.filter(n => n !== null).length > 5) {
      let i = Math.floor(Math.random() * 9);
      row[i] = null;
    }
  });

  return card;
}

function escucharJugadores() {
  const cont = document.getElementById("players");

  onSnapshot(collection(db, "players"), snapshot => {
    cont.innerHTML = "";

    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      const div = document.createElement("div");
      div.style.border = "1px solid #999";
      div.style.padding = "8px";
      div.style.marginBottom = "8px";

      div.innerHTML = `
        <strong>${p.username}</strong><br>
        Cartones asignados: ${p.numCartones || 0}<br><br>

        <select id="sel-${p.username}">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <button onclick="asignarCartones('${p.username}')">Asignar cartones</button>
      `;

      cont.appendChild(div);
    });
  });
}

window.asignarCartones = async function(username) {
  const select = document.getElementById(`sel-${username}`);
  const num = parseInt(select.value);

  // Generar los cartones automáticamente
  const cartones = [];
  for (let i = 0; i < num; i++) {
    cartones.push(generarCarton());
  }

  await updateDoc(doc(db, "players", username), {
    numCartones: num,
    estado: "jugando",
    cartones: cartones
  });
};
