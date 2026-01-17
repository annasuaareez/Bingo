import { db } from "./firebase.js";
import { ref, onValue, update, set } from
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const ADMINS = ["annasuaareez", "loveealchemist"];
const PASS = "N9q$A2vX7!";

window.loginAdmin = function () {
  if (!ADMINS.includes(adminUser.value) || adminPass.value !== PASS)
    return alert("Acceso denegado");

  panel.style.display = "block";
  escucharJugadores();
};

function escucharJugadores() {
  onValue(ref(db, "players"), snap => {
    players.innerHTML = "";
    const data = snap.val() || {};

    Object.entries(data).forEach(([user, p]) => {
      const div = document.createElement("div");

      div.innerHTML = `
        <strong>${user}</strong>
        <input type="number" min="1" max="5" value="${p.cards || 1}"
          onchange="asignar('${user}', this.value)">
        <div id="c-${user}"></div>
        <hr>
      `;
      players.appendChild(div);

      if (p.cartones)
        mostrarCartonesAdmin(p.cartones, `c-${user}`, user);
    });
  });
}

window.asignar = function (user, n) {
  update(ref(db, "players/" + user), { cards: +n });
};

window.comenzarPartida = function () {
  onValue(ref(db, "players"), snap => {
    const data = snap.val();
    Object.keys(data).forEach(user => {
      const cartones = {};
      for (let i = 0; i < data[user].cards; i++) {
        cartones[i] = generarCarton();
      }
      update(ref(db, "players/" + user), { cartones });
    });
    set(ref(db, "started"), true);
  }, { onlyOnce: true });
};

function generarCarton() {
  const ranges = [[1,9],[10,19],[20,29],[30,39],[40,49],[50,59],[60,69],[70,79],[80,90]];
  let card = Array.from({ length: 3 }, () => Array(9).fill(null));
  let used = new Set();

  for (let col = 0; col < 9; col++) {
    let nums = [];
    while (nums.length < 2) {
      let n = Math.floor(Math.random() *
        (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0];
      if (!used.has(n)) used.add(n), nums.push(n);
    }
    nums.forEach(n => {
      let r;
      do { r = Math.floor(Math.random() * 3); }
      while (card[r][col] !== null);
      card[r][col] = n;
    });
  }

  card.forEach(row => {
    while (row.filter(n => n !== null).length > 5)
      row[Math.floor(Math.random() * 9)] = null;
  });

  return card;
}

function mostrarCartonesAdmin(cartones, id, user) {
  const cont = document.getElementById(id);
  cont.innerHTML = "";

  Object.values(cartones).forEach((c, i) => {
    const title = document.createElement("div");
    title.textContent = `${user} - Cartón ${i + 1}`;
    title.style.fontWeight = "bold";

    const div = document.createElement("div");
    div.className = "bingo-card admin-view";

    c.flat().forEach(n => {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (n === null) cell.classList.add("empty");
      else cell.textContent = n;
      div.appendChild(cell);
    });

    cont.append(title, div);
  });
}
