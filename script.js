const ADMIN_USERS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "N9q$A2vX7!";

/* ================= USUARIO ================= */

function entrar() {
  const user = document.getElementById("username").value.trim();
  if (!user) return alert("Introduce un nombre");

  let players = JSON.parse(localStorage.getItem("players")) || [];

  if (!players.find(p => p.user === user)) {
    players.push({ user, cards: 1, cartones: [] });
    localStorage.setItem("players", JSON.stringify(players));
  }

  localStorage.setItem("currentUser", user);

  document.getElementById("login").style.display = "none";
  document.getElementById("waiting").style.display = "block";

  esperarInicio();
}

function esperarInicio() {
  const interval = setInterval(() => {
    if (localStorage.getItem("started") === "true") {
      clearInterval(interval);
      mostrarMisCartones();
    }
  }, 1000);
}

function mostrarMisCartones() {
  const user = localStorage.getItem("currentUser");
  const players = JSON.parse(localStorage.getItem("players")) || [];
  const player = players.find(p => p.user === user);

  document.getElementById("waiting").style.display = "none";
  mostrarCartones(player.cartones);
}

/* ================= ADMIN ================= */

function loginAdmin() {
  const u = document.getElementById("adminUser").value;
  const p = document.getElementById("adminPass").value;

  if (!ADMIN_USERS.includes(u) || p !== ADMIN_PASS) {
    return alert("Acceso denegado");
  }

  document.getElementById("adminPanel").style.display = "block";
  cargarAdmin();
}

function cargarAdmin() {
  const players = JSON.parse(localStorage.getItem("players")) || [];
  const cont = document.getElementById("players");
  cont.innerHTML = "";

  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "admin-player";

    div.innerHTML = `
      <strong>${p.user}</strong><br>
      Cartones:
      <input type="number" min="1" max="5" value="${p.cards}"
        onchange="asignarCartones(${i}, this.value)">
      <div class="admin-cards" id="admin-cards-${i}"></div>
      <hr>
    `;

    cont.appendChild(div);

    if (p.cartones && p.cartones.length > 0) {
      mostrarCartonesAdmin(p.cartones, `admin-cards-${i}`, p.user);
    }
  });
}

function asignarCartones(index, value) {
  let players = JSON.parse(localStorage.getItem("players"));
  players[index].cards = Math.min(5, Math.max(1, parseInt(value)));
  localStorage.setItem("players", JSON.stringify(players));
}

function comenzarPartida() {
  let players = JSON.parse(localStorage.getItem("players")) || [];

  players.forEach(p => {
    p.cartones = [];
    for (let i = 0; i < p.cards; i++) {
      p.cartones.push(generarCarton());
    }
  });

  localStorage.setItem("players", JSON.stringify(players));
  localStorage.setItem("started", "true");

  cargarAdmin();
  alert("Partida iniciada");
}

/* ================= BINGO ================= */

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
      let n = Math.floor(Math.random() *
        (ranges[col][1] - ranges[col][0] + 1)) + ranges[col][0];
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

  return card;
}

function mostrarCartones(cards) {
  const cont = document.getElementById("cards");
  cont.innerHTML = "";

  cards.forEach(card => {
    const div = document.createElement("div");
    div.className = "bingo-card";

    card.flat().forEach(n => {
      const c = document.createElement("div");
      c.className = "cell";

      if (n === null) {
        c.classList.add("empty");
      } else {
        c.textContent = n;
        c.onclick = () => c.classList.toggle("marked");
      }

      div.appendChild(c);
    });

    cont.appendChild(div);
  });
}

/* ====== VISTA ADMIN DE CARTONES ====== */

function mostrarCartonesAdmin(cards, containerId, username) {
  const cont = document.getElementById(containerId);
  cont.innerHTML = "";

  cards.forEach((card, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "admin-card-wrapper";

    const title = document.createElement("div");
    title.className = "admin-card-title";
    title.textContent = `${username} - Cartón ${index + 1}`;

    const div = document.createElement("div");
    div.className = "bingo-card admin-view";

    card.flat().forEach(n => {
      const c = document.createElement("div");
      c.className = "cell";

      if (n === null) {
        c.classList.add("empty");
      } else {
        c.textContent = n;
      }

      div.appendChild(c);
    });

    wrapper.appendChild(title);
    wrapper.appendChild(div);
    cont.appendChild(wrapper);
  });
}
