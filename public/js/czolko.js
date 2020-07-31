const chatIn = document.getElementById("chatIn");
const czolko = document.getElementById("czolko");
const startButton = document.getElementById("startButton");
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
  isAdmin = true;
  const div = document.createElement("div");
  div.innerHTML = `<p>Podaj ilosc zawodnikow</p><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(2)">2</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(3)">3</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(4)">4</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(5)">5</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(6)">6</button>`;
  admin.appendChild(div);
});

function iloscZawodnikow(number) {
  socket.emit("numberOfPlayers", number);
}
function startButtonFunction() {
  questionTable.innerHTML = "";
  startButton.style.visibility = "hidden";
  admin.innerHTML = "";
  socket.emit("startGameCzolko", 1);
}

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

  questionTable.innerHTML = `<button
  class="startButtonCzolko"
  id="startButton"
  onclick="startButtonFunction()"
>
  START
</button>`;
  admin.style.visibility = "visible";
  //passForm.style.visibility = "visible";
  questionForm.style.visibility = "hidden";
  const osoba = document.getElementById("osoba");
  osoba.innerHTML = "";
  if (isAdmin === true) {
    const div = document.createElement("div");
    div.innerHTML = `<p>Podaj ilosc zawodnikow</p><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(2)">2</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(3)">3</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(4)">4</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(5)">5</button><button class="numberOfPlayersButton" onclick = "iloscZawodnikow(6)">6</button>`;
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
    div.innerHTML = `<button class="endQuestionButton" id="endQuestion" onclick = "endQuestion()">ZAKONCZ PYTANIE</button>`;
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
