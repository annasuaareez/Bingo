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

// ADMINS PERMITIDOS
const ADMINS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "admin123";

window.loginAdmin = async function () {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value;

  if (!ADMINS.includes(user) || pass !== ADMIN_PASS) {
    alert("Acceso denegado");
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
        Cartones asignados: ${p.numCartones}<br><br>

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
