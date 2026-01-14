const ADMIN_USERS = ["annasuaareez", "loveealchemist"];
const ADMIN_PASS = "N9q$A2vX7!";

function entrar() {
  const user = document.getElementById("username").value;
  const num = parseInt(document.getElementById("numCards").value);

  if (!user || num < 1) return alert("Datos incorrectos");

  let data = JSON.parse(localStorage.getItem("bingoData")) || [];
  let allCards = JSON.parse(localStorage.getItem("allCards")) || [];

  let userCards = [];

  for (let i = 0; i < num; i++) {
    let card;
    do {
      card = generarCarton();
    } while (allCards.includes(JSON.stringify(card)));

    allCards.push(JSON.stringify(card));
    userCards.push(card);
  }

  data.push({ user, cards: userCards });

  localStorage.setItem("bingoData", JSON.stringify(data));
  localStorage.setItem("allCards", JSON.stringify(allCards));

  mostrarCartones(userCards);
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
      if (n === null) c.classList.add("empty");
      c.textContent = n || "";
      div.appendChild(c);
    });

    cont.appendChild(div);
  });
}

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
      let i = Math.floor(Math.random() * 9);
      row[i] = null;
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

        // 👉 CLICK PARA MARCAR / DESMARCAR
        c.addEventListener("click", () => {
          c.classList.toggle("marked");
        });
      }

      div.appendChild(c);
    });

    cont.appendChild(div);
  });
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

        // 👉 CLICK PARA MARCAR / DESMARCAR
        c.addEventListener("click", () => {
          c.classList.toggle("marked");
        });
      }

      div.appendChild(c);
    });

    cont.appendChild(div);
  });
}

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
  const data = JSON.parse(localStorage.getItem("bingoData")) || [];
  const cont = document.getElementById("players");
  cont.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${p.user}</strong> - ${p.cards.length} cartones`;
    cont.appendChild(div);
  });
}
