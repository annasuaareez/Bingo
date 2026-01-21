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
import { app } from "./firebase.js";

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

// GENERAR CARTÓN
function generarCarton() {
  const ranges = [
    [1,9],[10,19],[20,29],[30,39],
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

  // 🔥 SOLO OBJETOS
  return {
    f1: card[0],
    f2: card[1],
    f3: card[2]
  };
}

// ESCUCHAR JUGADORES
function escucharJugadores() {
  const cont = document.getElementById("players");

  onSnapshot(collection(db, "players"), snapshot => {
    cont.innerHTML = "";
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      if (p.estado==="finalizado") return;

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
      const cartones = [];

      for (let i = 0; i < p.numCartones; i++) {
        cartones.push(generarCarton()); // ← objeto
      }

      await updateDoc(doc(db, "players", docSnap.id), {
        estado: "jugando"
      });
    }
  }

  alert("Partida iniciada");
};


// BOMBO DE NÚMEROS
async function mostrarNumeros(){
  const todosNumeros=Array.from({length:39},(_,i)=>i+1);
  let numerosDisponibles=[...todosNumeros];
  const cont=document.getElementById("numero-cantado");

  for(let i=0;i<39;i++){
    if(numerosDisponibles.length===0) break;
    const index=Math.floor(Math.random()*numerosDisponibles.length);
    const numero=numerosDisponibles[index];
    numerosDisponibles.splice(index,1);

    cont.textContent=numero;
    await new Promise(res=>setTimeout(res,2000));
    cont.textContent="";
  }

  cont.textContent="Bingo terminado";

  // Cambiar estado a finalizado
  const snapshot=await getDocs(collection(db,"players"));
  snapshot.forEach(async docSnap=>{
    const p=docSnap.data();
    if(p.estado==="jugando"){
      await updateDoc(doc(db,"players",p.username),{estado:"finalizado"});
    }
  });
}
