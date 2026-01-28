import { 
  getFirestore, doc, setDoc, updateDoc, collection, onSnapshot, getDocs, arrayUnion, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { app } from "../../firebase.js";

const db = getFirestore(app);

// Admins permitidos
const ADMINS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "admin123";

let gameEstado = "finalizado"; // Estado global

// ========================
// LOGIN ADMIN
// ========================
window.loginAdmin = async function () {
  const rawUser = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  const user = rawUser.trim().toLowerCase();

  if (!ADMINS.includes(user)) return alert("Usuario no autorizado");
  if (pass !== ADMIN_PASS) return alert("Contraseña incorrecta");

  await setDoc(doc(db, "admins", user), {
    username: user,
    conectado: true,
    lastLogin: serverTimestamp()
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("panel").style.display = "block";

  escucharJuego();
  escucharJugadores();
};

// ========================
// ESCUCHAR ESTADO GLOBAL DEL JUEGO
// ========================
function escucharJuego() {
  const gameRef = doc(db, "game", "gameState");

  onSnapshot(gameRef, snap => {
    const data = snap.data();
    if (!data) return;

    gameEstado = data.estado;
    document.getElementById("estado-juego").textContent = `Estado: ${gameEstado}`;
  });
}

// ========================
// ESCUCHAR JUGADORES
// ========================
function escucharJugadores() {
  const playersCont = document.getElementById("players");

  onSnapshot(collection(db, "players"), async snapshot => {
    playersCont.innerHTML = "";

    snapshot.forEach(docSnap => {
      const p = docSnap.data();

      const div = document.createElement("div");
      div.style.border = "1px solid #999";
      div.style.padding = "8px";
      div.style.marginBottom = "8px";

      // Jugadores que ya están jugando
      if (p.estado === "jugando") {
        div.innerHTML = `
          <strong>${p.username}</strong><br>
          Cartones asignados: ${p.numCartones || 0}<br>
          <em>Jugando actualmente</em>
        `;
        playersCont.appendChild(div);
        return;
      }

      // Jugadores en espera solo si no hay partida en curso
      if (p.estado === "espera" && gameEstado !== "jugando") {
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
        playersCont.appendChild(div);
      }
    });
  });
}

// ========================
// ASIGNAR CARTONES
// ========================
window.asignarCartones = async function(username) {
  const select = document.getElementById(`sel-${username}`);
  const num = parseInt(select.value);

  await updateDoc(doc(db, "players", username), {
    numCartones: num,
    estado: "espera" // Mantener en espera hasta iniciar partida
  });
};

// ========================
// INICIAR PARTIDA
// ========================
window.iniciarPartida = async function () {
  if (gameEstado === "jugando") return alert("Ya hay una partida en curso");

  const snapshot = await getDocs(collection(db, "players"));

  // Solo actualizar estado de jugadores que tienen cartones asignados
  for (const docSnap of snapshot.docs) {
  const p = docSnap.data();
  const userRef = doc(db, "players", docSnap.id);

  if ((p.estado === "espera") && p.numCartones > 0) {
    // Generar cartones si no existen
    if (!Array.isArray(p.cartones) || p.cartones.length === 0) {
      const cartones = [];
      for (let i = 0; i < p.numCartones; i++) {
        cartones.push(generarCarton());
      }
      await setDoc(userRef, { cartones, estado: "jugando" }, { merge: true });
    } else {
      await updateDoc(userRef, { estado: "jugando" });
    }
  }
}

  // Crear estado global del juego
  await setDoc(doc(db, "game", "gameState"), {
    estado: "jugando",
    startedAt: serverTimestamp(),
    numeroActual: null,
    numerosSalidos: []
  });

  iniciarBombo();
  alert("Partida iniciada");
};

// ========================
// BOMBO DE NÚMEROS
// ========================
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

  // Finalizar partida
  await updateDoc(gameRef, { estado: "finalizado", numeroActual: null });

  const snapshot = await getDocs(collection(db, "players"));
  for (const docSnap of snapshot.docs) {
    const p = docSnap.data();
    if (p.estado === "jugando") {
      await updateDoc(doc(db, "players", docSnap.id), { estado: "finalizado" });
    }
  }
}
