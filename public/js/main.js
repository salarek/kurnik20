const chatIn = document.getElementById("chatIn");
const wisielec = document.getElementById("wisielec");
const startGamee = document.getElementById("startGame");
const chat = document.getElementById("chat");
const passForm = document.getElementById("passForm");
const selectPassword = document.getElementById("selectPassword");
let changeValue = false;
const { username, room, game } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const comparePassword = [];
var punkty = 0;
const socket = io();
let inputLetter = "";

socket.emit("joinRoom", { username, room, game });

// message from server to chat
socket.on("message", (message) => {
  outputMessage(message);

  //scroll down
  chat.scrollTop = chat.scrollHeight;
});
//message from server to show on game container
socket.on("GamePassword", (msg) => {
  outputGameMessage(msg);
});

//message from server to break game because player typed correct password
socket.on("playerWon", (msg) => {
  comparePassword[3] = msg;
});

socket.on("QUE", (msg) => {
  if (msg == username) {
    selectPassword.style.visibility = "visible";
  }
  const div = document.createElement("div");
  //div.classList.add("message");
  div.innerHTML = `<p style = "color:#cf0000";>BOT :<span style = "color: white"> Kolej gracza: ${msg}</span></p>`;
  document.getElementById("chat").appendChild(div);
});
// message submit from chat input
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

startGamee.addEventListener("submit", (e) => {
  e.preventDefault();
  const button = e.target.elements.startButton;
  wisielec.style.visibility = "hidden";
  button.style.visibility = "hidden";
  socket.emit("startGame", 1);
});

//password submit from password input
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
    selectPassword.style.visibility = "hidden";
  }
});

function outputMessage(message) {
  const div = document.createElement("div");
  //div.classList.add("message");
  div.innerHTML = `<p style = "color:#cf0000";>${message.username}:<span style = "color: white"> ${message.text}</span></p>`;
  document.getElementById("chat").appendChild(div);
}

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
  let chances = 5;
  let waiting = false;
  zegar = 30;
  for (i = 0; i < 30; i++) {
    zegar--;
    czas = document.getElementById("czas");
    czas.innerHTML = `<p>czas: ${zegar}</p>`;
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
        console.log(changeValue);
        if (changeValue === true) {
          changeValue = false;
          chances--;
        }
        console.log(chances);
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
        tabela.innerHTML = `<p>${punkty}</p>`;
        socket.emit("koniecTury", comparePassword[0]);

        break;
      }
    }
    if (i === 29) {
      div.innerHTML = `<p> Za pozno! Haslo to: ${msg} </p>`;
      document.getElementById("chat").appendChild(div);
      punkty = punkty - 10;
      tabela = document.getElementById("pkt");
      tabela.innerHTML = `<p>${punkty}</p>`;
      socket.emit("koniecTuryLoss", "koniec");
    }
  }
}

function queOrder(msg) {
  console.log(msg);
  const passContainer = document.getElementById("selectPasswordContainer");
  passContainer.style.display = "block";
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
