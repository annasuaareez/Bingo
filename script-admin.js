import { db } from "./firebase.js";
import {
  doc, onSnapshot, updateDoc, setDoc, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const ADMINS = ["annasuaareez", "loveealchemist"];
const PASS = "N9q$A2vX7!";
const PRECIO = 50000;

window.loginAdmin = async () => {
  const u = adminUser.value;
  const p = adminPass.value;
  if (!ADMINS.includes(u) || p !== PASS) return alert("No autorizado");

  panel.style.display = "block";

  onSnapshot(doc(db, "game", "current"), snap => {
    const g = snap.data();
    const v = document.getElementById("validaciones");
    v.innerHTML = "";

    if (g?.lineaCantada && !g.lineaCantada.validada) {
      v.innerHTML += `<button onclick="validarLinea('${g.lineaCantada.user}')">
        Validar Línea de ${g.lineaCantada.user}</button>`;
    }

    if (g?.bingoCantado && !g.bingoCantado.validada) {
      v.innerHTML += `<button onclick="validarBingo('${g.bingoCantado.user}')">
        Validar Bingo de ${g.bingoCantado.user}</button>`;
    }
  });
};

window.validarLinea = async user => {
  const bote = await calcularBote();
  await setDoc(doc(db, "history", Date.now().toString()), {
    tipo: "LINEA",
    user,
    premio: bote.linea
  });
  await updateDoc(doc(db, "game", "current"), {
    lineaCantada: { user, validada: true }
  });
};

window.validarBingo = async user => {
  const bote = await calcularBote();
  await setDoc(doc(db, "history", Date.now().toString()), {
    tipo: "BINGO",
    user,
    premio: bote.bingo
  });
  await updateDoc(doc(db, "game", "current"), {
    bingoCantado: { user, validada: true }
  });
};

async function calcularBote() {
  const snap = await getDocs(collection(db, "players"));
  let total = 0;
  snap.forEach(p => total += p.data().dineroTotal);
  return {
    linea: total * 0.2,
    bingo: total * 0.8
  };
}

window.reiniciar = async () => {
  await updateDoc(doc(db, "game", "current"), {
    lineaCantada: null,
    bingoCantado: null
  });
  alert("Partida reiniciada");
};
