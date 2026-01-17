import { db } from "./firebase.js";
import { ref, set, onValue } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

window.entrar = function () {
  const user = username.value.trim();
  if (!user) return alert("Introduce tu nombre");

  set(ref(db, "players/" + user), {
    cards: 1,
    cartones: {}
  });

  login.style.display = "none";
  waiting.style.display = "block";

  onValue(ref(db, "started"), snap => {
    if (snap.val() === true) escucharCartones(user);
  });
};

function escucharCartones(user) {
  onValue(ref(db, "players/" + user + "/cartones"), snap => {
    const data = snap.val();
    if (data) mostrarCartones(Object.values(data));
  });
}

function mostrarCartones(cartones) {
  cards.innerHTML = "";
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

    cards.appendChild(div);
  });
}
