import { db } from "./firebase.js";
import {
  doc, setDoc, onSnapshot, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

let currentUser = "";

window.entrar = async () => {
  currentUser = document.getElementById("username").value.trim();
  if (!currentUser) return alert("Nombre obligatorio");

  await setDoc(doc(db, "players", currentUser), {
    username: currentUser,
    cartones: {},
    numCartones: 0,
    dineroTotal: 0
  });

  document.getElementById("login").style.display = "none";
  document.getElementById("waiting").style.display = "block";

  onSnapshot(doc(db, "players", currentUser), snap => {
    const d = snap.data();
    if (d.cartones && Object.keys(d.cartones).length > 0) {
      mostrarCartones(Object.values(d.cartones));
    }
  });

  onSnapshot(doc(db, "game", "current"), snap => {
    const g = snap.data();
    if (g?.lineaCantada)
      document.getElementById("avisos").innerText =
        `LÍNEA cantada por ${g.lineaCantada.user}`;
    if (g?.bingoCantado)
      document.getElementById("avisos").innerText =
        `BINGO cantado por ${g.bingoCantado.user}`;
  });
};

window.cantarLinea = async () => {
  await updateDoc(doc(db, "game", "current"), {
    lineaCantada: { user: currentUser, validada: false }
  });
};

window.cantarBingo = async () => {
  await updateDoc(doc(db, "game", "current"), {
    bingoCantado: { user: currentUser, validada: false }
  });
};

function mostrarCartones(cartones) {
  const cont = document.getElementById("cards");
  cont.innerHTML = "";
  cartones.forEach(card => {
    const div = document.createElement("div");
    div.className = "bingo-card";
    card.flat().forEach(n => {
      const c = document.createElement("div");
      c.className = "cell";
      if (n === null) c.classList.add("empty");
      else {
        c.textContent = n;
        c.onclick = () => c.classList.toggle("marked");
      }
      div.appendChild(c);
    });
    cont.appendChild(div);
  });
}
