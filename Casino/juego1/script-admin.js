import { getFirestore, doc, setDoc, updateDoc, collection, onSnapshot, getDocs, arrayUnion, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
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

  escucharJugadores();
};

// ESCUCHAR JUGADORES (solo jugadores activos)
function escucharJugadores() {
  const cont = document.getElementById("players");
  const gameRef = doc(db, "game", "gameState");

  // Escuchar cambios en la partida
  onSnapshot(gameRef, async (gameSnap) => {
    const gameData = gameSnap.data();
    const gameEstado = gameData?.estado;

    const playersSnapshot = await getDocs(collection(db, "players"));
    cont.innerHTML = "";

    playersSnapshot.forEach(docSnap => {
      const p = docSnap.data();

      // Solo mostrar jugadores si el juego NO está en curso
      if (gameEstado === "jugando") return;

      // Solo mostrar jugadores que estén en "espera"
      if (p.estado !== "espera") return;

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
      await updateDoc(doc(db, "players", docSnap.id), { estado: "jugando" });
    }
  }

  // Estado global del juego
  await setDoc(doc(db, "game", "gameState"), {
    estado: "jugando",
    startedAt: serverTimestamp(),
    numeroActual: null,
    numerosSalidos: []
  });

  iniciarBombo();
  alert("Partida iniciada");
};

// BOMBO DE NÚMEROS
async function iniciarBombo() {
  const gameRef = doc(db, "game", "gameState");
  const todosNumeros = Array.from({ length: 39 }, (_, i) => i + 1);
  let numerosDisponibles = [...todosNumeros];

  while (numerosDisponibles.length > 0) {
    const index = Math.floor(Math.random() * numerosDisponibles.length);
    const numero = numerosDisponibles[index];
    numerosDisponibles.splice(index, 1);

    await updateDoc(gameRef, {
      numeroActual: numero,
      numerosSalidos: arrayUnion(numero)
    });

    await new Promise(res => setTimeout(res, 2000));
  }

  await updateDoc(gameRef, { estado: "finalizado", numeroActual: null });

  const snapshot = await getDocs(collection(db, "players"));
  snapshot.forEach(async docSnap => {
    const p = docSnap.data();
    if (p.estado === "jugando") {
      await updateDoc(doc(db, "players", p.username), { estado: "finalizado" });
    }
  });
}
