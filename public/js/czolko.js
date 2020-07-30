const chatIn = document.getElementById("chatIn");
const czolko = document.getElementById("czolko");
const startGamee = document.getElementById("startGame");
const chat = document.getElementById("chat");
const passForm = document.getElementById("passForm");
const questionForm = document.getElementById("questionForm");
const question = document.getElementById("question");
const questionTable = document.getElementById("questionTable");
const selectPassword2 = document.getElementById("selectPassword2");
const personInfo = document.getElementById("personInfo");
const admin = document.getElementById("admin");
let isAdmin = false;
let changeValue = false;
let yourPassword = "";
let { username, room, game } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const comparePassword = [];
var punkty = 0;
const socket = io();
let inputLetter = "";
room = room + game;
socket.emit("joinRoom", { username, room, game });
socket.emit("gameInfo", game);
socket.on("adminTable", (msg) => {
  console.log("WYPISZ ADMINA");
  const adminShow = document.getElementById("adminShow");
  adminShow.innerHTML = `ADMIN ${msg}`;
});
socket.on("admin", () => {
  console.log("JESTEM ADMINEM DO KURWY");
  isAdmin = true;
  const div = document.createElement("div");
  div.innerHTML = `<p>Podaj ilosc zawodnikow</p><button onclick = "iloscZawodnikow(2)">2</button><button onclick = "iloscZawodnikow(3)">3</button><button onclick = "iloscZawodnikow(4)">4</button>`;
  admin.appendChild(div);
});

function iloscZawodnikow(number) {
  socket.emit("numberOfPlayers", number);
}
startGamee.addEventListener("submit", (e) => {
  e.preventDefault();
  const button = e.target.elements.startButton;

  button.style.visibility = "hidden";
  admin.innerHTML = "";
  socket.emit("startGameCzolko", 1);
});

chatIn.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("clientMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
// przechwycenie wiadomosci od uzytkownikow i wyswietlenie jej na czacie
socket.on("message", (message) => {
  outputMessage(message);

  //scroll down
  chat.scrollTop = chat.scrollHeight;
});
function outputMessage(message) {
  const div = document.createElement("div");
  //div.classList.add("message");
  div.innerHTML = `<p style = "color:#cf0000";>${message.username}:<span style = "color: white"> ${message.text}</span></p>`;
  document.getElementById("chat").appendChild(div);
}

socket.on("RoundStart", () => {
  console.log("ROUND START");
  passForm.style.visibility = "visible";
});
socket.on("RoundStartReset", () => {
  console.log("ROUND START");

  admin.style.visibility = "visible";
  passForm.style.visibility = "visible";
  questionForm.style.visibility = "hidden";
  const osoba = document.getElementById("osoba");
  osoba.innerHTML = "";
  if (isAdmin === true) {
    const div = document.createElement("div");
    div.innerHTML = `<p>Podaj ilosc zawodnikow</p><button onclick = "iloscZawodnikow(2)">2</button><button onclick = "iloscZawodnikow(3)">3</button><button onclick = "iloscZawodnikow(4)">4</button>`;
    admin.appendChild(div);
  }
});

passForm.addEventListener("submit", (e) => {
  e.preventDefault();
  while (e.target.elements.password.value.length > 30) {
    alert("Maksymalnie 30 znakow!");
    e.target.elements.password.value = "";
  }
  if (e.target.elements.password.value) {
    const msg = e.target.elements.password.value;
    socket.emit("passwordForNextUser", msg);
    e.target.elements.password.value = "";

    passForm.style.visibility = "hidden";
  }
});

socket.on("passwordReceive", (usr, passwordRec) => {
  if (username === usr) {
    yourPassword = passwordRec;
  } else {
    const div = document.createElement("div");
    div.innerHTML = `<p>${usr} : ${passwordRec}</p>`;
    document.getElementById("osoba").appendChild(div);
  }
});
socket.on("QUE2", (msg) => {
  questionTable.innerHTML = "";
  console.log("NEXT USER");
  console.log(msg);
  if (msg == username) {
    questionForm.style.visibility = "visible";
  } else {
    questionForm.style.visibility = "hidden";
  }
  const div = document.createElement("div");
  div.innerHTML = `<p style = "color:#cf0000";>BOT :<span style = "color: white"> Pytanie zadaje gracz: ${msg}</span></p>`;
  document.getElementById("chat").appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

questionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  while (e.target.elements.question.value.length > 60) {
    alert("Maksymalnie 60 znakow!");
    e.target.elements.question.value = "";
  }
  if (e.target.elements.question.value) {
    const msg = e.target.elements.question.value;
    socket.emit("sendQuestion", msg);
    e.target.elements.question.value = "";

    questionForm.style.visibility = "hidden";
    const div = document.createElement("div");
    div.innerHTML = `<button id="endQuestion" onclick = "endQuestion()">ZAKONCZ PYTANIE</button>`;
    questionTable.appendChild(div);
  }
  if (e.target.elements.answer.value) {
    const msg = e.target.elements.answer.value;
    if (msg === yourPassword) {
      const div = document.createElement("div");
      div.innerHTML = `<p style = "color:#cf0000";>BOT :<span style = "color: white"> DOBRZE!!!! Twoja postac to: ${msg}</span></p>`;
      e.target.elements.answer.value = "";
      document.getElementById("chat").appendChild(div);
      socket.emit("endQuestion", msg, username);
    } else {
      const div = document.createElement("div");
      div.innerHTML = `<p style = "color:#cf0000";>BOT :<span style = "color: white"> Bledna odpowiedz</span></p>`;
      e.target.elements.answer.value = "";
      endQuestion();
    }
  }
  chat.scrollTop = chat.scrollHeight;
});

socket.on("questionShow", (msg) => {
  const div = document.createElement("div");
  div.innerHTML = `<p>${msg}</p>`;
  questionTable.appendChild(div);
});

function endQuestion() {
  socket.emit("endQuestion");
}

socket.on("winner", (msg, usr) => {
  const div = document.createElement("div");
  div.innerHTML = `<p style = "color:#cf0000";>BOT :<span style = "color: white"> DOBRZE!!!! ${usr} odgadl swoja postac: ${msg}</span></p>`;
  document.getElementById("chat").appendChild(div);
  chat.scrollTop = chat.scrollHeight;
});

/*
//przechwychenie hasla z serwera i rozpoczecie glownej funkcji gry
socket.on("GamePassword", (msg) => {
  outputGameMessage(msg);
});

//Hasło przekazane od użytkownika ktory wygral turę aby inni mogli rowniez zakonczyc ture
//comparePassword jest uzyte w glownej funkcji gry
socket.on("playerWon", (msg) => {
  comparePassword[3] = msg;
});

//pobranie od serwera kolejki, ktora zwraca uzytkownika, który ma rozpocząć kolejną turę
socket.on("QUE", (msg) => {
  console.log("NEXT USER");
  console.log(msg);
  if (msg == username) {
    chatIn.style.visibility = "hidden";
  } else {
    chatIn.style.visibility = "visible";
  }
  const div = document.createElement("div");
  //div.classList.add("message");
  div.innerHTML = `<p style = "color:#cf0000";>BOT :<span style = "color: white"> Kolej gracza: ${msg}</span></p>`;
  document.getElementById("chat").appendChild(div);
});

//aktualizacja punktow w instniejacym polu na stronie
socket.on("pointsInDOM", (msg) => {
  const gracz = document.getElementById(`${msg.username}`);
  gracz.innerHTML = `<p>${msg.username} : ${msg.punkty}</p>`;
});

//Kasowanie danych o punktach uzytkowniak w przypadku gdy oposci pokoj
socket.on("erasePointsfromDOM", (msg) => {
  const gracz = document.getElementById(`${msg}`);
  gracz.remove();
});

//Inicjalizacja punktow graczy, ktorzy polaczyli sie z pokojem - tworzenie divów z punktami
//na stronie.
socket.on("settingPoints", (msg) => {
  const div = document.createElement("div");
  div.innerHTML = `<p>${msg} : 0</p>`;
  div.id = msg;
  document.getElementById("playersPoints").appendChild(div);
  //wysylanie do serwera informacji o punktach (kazdy klient wysyla swoje punkty),
  //jest to po to aby w razie gdy nowy gracz dołączy do gry mógł pobrać punkty zdobyte już przez
  //innych uzytkowników i widzieć je na stronie
  socket.emit("userPointsInfo", { username, punkty });
});

//tworzenie nowych div-ow z punktami dla graczy, ktorzy dolaczyli do gry. Jezeli gracz posiada juz swoja
//punktacje na stronie to nei tworzy sie dla niego nowego diva
socket.on("createNewPointsInDOM", (msg) => {
  const userRegistered = document.getElementById(`${msg.username}`);
  if (!userRegistered) {
    const div = document.createElement("div");
    div.innerHTML = `<p>${msg.username} : ${msg.punkty}</p>`;
    div.id = msg.username;
    document.getElementById("playersPoints").appendChild(div);
  }
});

// wiadomosc z chatu - z inputa, przeslana na serwer
chatIn.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  comparePassword[0] = msg;
  inputLetter = msg;
  if (changeValue === false) {
    changeValue = true;
  } else {
    changeValue = false;
  }

  socket.emit("clientMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
//Obsluga konca rozgrywki (kiedy gracz wygra rozgrywke)
socket.on("resetGameClient", (msg) => {
  punkty = 0;
  const div = document.createElement("div");
  div.innerHTML = `Gracz ${msg} WYGRAL!!!!`;
  document.getElementById("chat").appendChild(div);
  const gracz2 = document.getElementById(`${username}`);
  gracz2.innerHTML = `<p>${username} : ${punkty}</p>`;
  //ponowne przekazanie punktow - juz zresetowanych
  socket.emit("userPointsInfo", { username, punkty });
});

//wcisniecie przycisku start - rozpoczecie rogrywki
startGamee.addEventListener("submit", (e) => {
  e.preventDefault();
  const button = e.target.elements.startButton;
  wisielec.style.visibility = "hidden";
  button.style.visibility = "hidden";
  socket.emit("startGameCzolko", 1);
});

//obsluga zdarzenia zatwierdzenia wprowadzania hasla do gry
passForm.addEventListener("submit", (e) => {
  e.preventDefault();
  while (e.target.elements.password.value.length > 30) {
    alert("Maksymalnie 30 znakow!");
    e.target.elements.password.value = "";
  }
  if (e.target.elements.password.value) {
    const msg = e.target.elements.password.value;
    socket.emit("clientPassMessage", msg);
    e.target.elements.password.value = "";
  }
});
// zapisanie wiadomosci na czacie
function outputMessage(message) {
  const div = document.createElement("div");
  //div.classList.add("message");
  div.innerHTML = `<p style = "color:#cf0000";>${message.username}:<span style = "color: white"> ${message.text}</span></p>`;
  document.getElementById("chat").appendChild(div);
}
//glowna funkcja gry - uruchamia sie za kazdym razem gdy uzytkownik poda haslo
async function outputGameMessage(msg) {
  comparePassword[1] = msg;
  const div = document.createElement("div");
  //div.classList.add("message");
  index = [];
  tabOfChar = [];
  password = [];
  msgg = [...msg];

  for (i = 0; i < msgg.length; i++) {
    tabOfChar[i] = msgg[i];
  }

  for (i = 0; i < msgg.length; i++) {
    password[i] = "_";
  }
  for (j = 0; j < msgg.length; j++) {
    if (msgg[j] === " ") {
      password[j] = "-";
    }
  }

  visiblePassword = password;
  let zdanie = visiblePassword.findIndex(
    (sp, index) => sp === "-" && index > 8
  );
  if (zdanie > -1) {
    visiblePassword.splice(zdanie, 0, "<br>");
    msgg.splice(zdanie, 0, "<br>");
  }
  let zdanie2 = visiblePassword.findIndex(
    (sp, index) => sp === "-" && index > 20
  );
  if (msgg.length > 30) {
    if (zdanie2 > -1) {
      visiblePassword.splice(zdanie2, 0, "<br>");
      msgg.splice(zdanie2, 0, "<br>");
    }
  }
  div.innerHTML = `<p> ${visiblePassword}</p>`;
  document.getElementById("gameContainer").appendChild(div);
  msgLen = msgg.length;
  let chances = 15;
  let waiting = false;
  zegar = 60;
  for (i = 0; i < 60; i++) {
    zegar--;
    czas = document.getElementById("czas");
    czas.innerHTML = `<p>czas: ${zegar}</p>`;
    szanse = document.getElementById("szanse");
    szanse.innerHTML = `<p>szanse: ${chances}</p>`;
    await sleep(1000);
    let tabWithIndex = [];
    if (waiting === false) {
      let z = 0;

      if (chances >= 0) {
        msgg.findIndex((sp, index) => {
          if (sp === inputLetter) {
            tabWithIndex[z] = index;
            z++;
          }
        });

        if (changeValue === true) {
          changeValue = false;
          chances--;
        }
      } else {
        div.innerHTML = `<p> Jestes Wisielcem! Czekanie na pozostalych... </p>`;
        document.getElementById("chat").appendChild(div);
        punkty = punkty - 10;
        tabela = document.getElementById("pkt");
        tabela.innerHTML = `<p>${punkty}</p>`;
        //socket.emit("koniecTuryLoss", "koniec");
        waiting = true;
      }
    }
    if (waiting === false) {
      for (x = 0; x < tabWithIndex.length; x++) {
        password[tabWithIndex[x]] = msgg[tabWithIndex[x]];
      }

      div.innerHTML = `<p> ${visiblePassword}</p>`;
      document.getElementById("gameContainer").appendChild(div);

      //wisielec.innerHTML = `<img src="assets/${i}.png" alt="" />`;
    }
    if (comparePassword[1] === comparePassword[3]) {
      div.innerHTML = `DOBRZE!!!! ${msg.toUpperCase()} to poprawne haslo!</p>`;
      document.getElementById("chat").appendChild(div);
      break;
    }
    if (waiting === false) {
      if (comparePassword[0] === comparePassword[1]) {
        div.innerHTML = `<p>DOBRZE!!!! ${msg.toUpperCase()} to poprawne haslo!</p>`;
        document.getElementById("chat").appendChild(div);
        punkty = punkty + msgLen;
        tabela = document.getElementById("pkt");
        tabela.innerHTML = `<p>Twoje punkty: ${punkty}</p>`;

        socket.emit("koniecTury", comparePassword[0]);
        socket.emit("userPointsInfo", { username, punkty });
        if (punkty > 30) {
          div.innerHTML = `<p>Gracz ${username} WYGRAL!!!!</p>`;
          document.getElementById("chat").appendChild(div);
          socket.emit("resetGame", username);
        }

        break;
      }
    }
    if (i === 59) {
      div.innerHTML = `<p> Za pozno! Haslo to: ${msg} </p>`;
      document.getElementById("chat").appendChild(div);
      punkty = punkty - 10;
      tabela = document.getElementById("pkt");
      tabela.innerHTML = `<p>Twoje punkty: ${punkty}</p>`;
      socket.emit("koniecTuryLoss", "koniec");
      socket.emit("userPointsInfo", { username, punkty });
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
*/
