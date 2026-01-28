import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { app } from "../../firebase.js";

const db = getFirestore(app);

// Admins permitidos
const ADMINS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "admin123";

// LOGIN ADMIN
window.loginAdmin = async function () {
  const rawUser = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  const user = rawUser.trim().toLowerCase();

  if (!ADMINS.includes(user)) return alert("Usuario no autorizado");
  if (pass !== ADMIN_PASS) return alert("Contraseña incorrecta");

  // Guardar admin en Firestore
  await setDoc(doc(db, "admins", user), {
    username: user,
    conectado: true,
    lastLogin: serverTimestamp()
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("panel").style.display = "block";

  crearPanelNumeros();
  escucharJuego();
  escucharJugadores();
};

function crearPanelNumeros() {
  const panel = document.getElementById("panel-numeros");
  panel.innerHTML = "";
  for (let i = 1; i <= 49; i++) {
    const d = document.createElement("div");
    d.id = `num-${i}`;
    d.className = "numero";
    d.textContent = i;
    panel.appendChild(d);
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

// ESCUCHAR JUGADORES
function escucharJugadores() {
  const cont = document.getElementById("players");

  onSnapshot(collection(db, "players"), snapshot => {
    cont.innerHTML = "";
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      // 🔥 NO mostrar jugadores en espera ni finalizados
      if (p.estado === "espera" || p.estado === "finalizado") return;

      const div = document.createElement("div");
      div.style.border="1px solid #999";
      div.style.padding="8px";
      div.style.marginBottom="8px";

      div.innerHTML = `
        <strong>${p.username}</strong><br>
        Cartones asignados: ${p.numCartones||0}<br><br>

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

// GENERAR CARTÓN
function generarCarton() {
  const ranges = [
    [1,9],[10,19],[20,29],[30,39],
    [40,49]
  ];

  let card = Array.from({ length: 3 }, () => Array(7).fill(null));
  let used = new Set();

  for (let col = 0; col < 7; col++) {
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
      row[Math.floor(Math.random() * 7)] = null;
    }
  });

  // 🔥 SOLO OBJETOS
  return {
    f1: card[0],
    f2: card[1],
    f3: card[2]
  };
}

// ASIGNAR CARTONES
window.asignarCartones = async function(username) {
  const select = document.getElementById(`sel-${username}`);
  const num = parseInt(select.value);
  await updateDoc(doc(db, "players", username), {
    numCartones: num,
    estado: "espera"
  });
};

// INICIAR PARTIDA
window.iniciarPartida = async function () {
  const snapshot = await getDocs(collection(db, "players"));

  for (const docSnap of snapshot.docs) {
    const p = docSnap.data();

    if ((p.estado === "espera" || p.estado === "jugando") && p.numCartones > 0) {
      
      await updateDoc(doc(db, "players", docSnap.id), {
        estado: "jugando",
        cartones
      });
    }
  }

  // 🔥 Actualizar estado global
  await setDoc(doc(db, "game", "gameState"), {
    estado: "jugando",
    numerosSalidos: [],
    startedAt: serverTimestamp()
  });

  alert("Partida iniciada");
};

window.iniciarBombo = async function () {
  let disponibles = Array.from({ length: 49 }, (_, i) => i + 1);
  let salidos = [];

  while (disponibles.length) {
    const n = disponibles.splice(
      Math.floor(Math.random() * disponibles.length), 1
    )[0];

    salidos.push(n);

    await updateDoc(doc(db, "game", "gameState"), {
      numeroActual: n,
      numerosSalidos: salidos
    });

    await new Promise(r => setTimeout(r, 2000));
  }
};

