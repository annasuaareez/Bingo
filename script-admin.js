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

// ADMINS PERMITIDOS (SIEMPRE EN MINÚSCULAS)
const ADMINS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "admin123";

window.loginAdmin = async function () {
  // 🔒 NORMALIZAMOS EL USUARIO
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

  // ✅ GUARDAR ADMIN EN FIRESTORE (SIEMPRE)
  await setDoc(doc(db, "admins", user), {
    username: user,
    conectado: true,
    lastLogin: serverTimestamp()
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("panel").style.display = "block";

  escucharJugadores();
};

function escucharJugadores() {
  const cont = document.getElementById("players");

  // 🔥 TIEMPO REAL (usuarios antes y después)
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

        <button onclick="asignarCartones('${p.username}')">
          Asignar cartones
        </button>
      `;

      cont.appendChild(div);
    });
  });
}

window.asignarCartones = async function (username) {
  const select = document.getElementById(`sel-${username}`);
  const num = parseInt(select.value);

  await updateDoc(doc(db, "players", username), {
    numCartones: num,
    estado: "jugando"
  });
};
