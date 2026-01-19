import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

// Obtener usuario del parámetro URL
const params = new URLSearchParams(window.location.search);
const currentUser = params.get("user");

if (!currentUser) {
  alert("Usuario no válido");
  throw new Error("No se proporcionó usuario");
}

const userRef = doc(db, "players", currentUser);

onSnapshot(userRef, snap => {
  const data = snap.data();
  if (!data || !data.cartones) return;

  mostrarCartones(data.cartones);
});

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
      else c.textContent = n;

      // Marcar al hacer click
      c.addEventListener("click", () => c.classList.toggle("marked"));

      div.appendChild(c);
    });

    cont.appendChild(div);
  });
}
