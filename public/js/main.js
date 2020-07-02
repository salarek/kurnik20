const chatIn = document.getElementById("chatIn");
const wisielec = document.getElementById("wisielec");
const chat = document.querySelector(".chat");
const passForm = document.getElementById("passForm");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const comparePassword = [];
var punkty = 0;
const socket = io();

socket.emit("joinRoom", { username, room });

// message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //scroll down
  chat.scrollTop = chat.scrollHeight;
});
socket.on("GamePassword", (msg) => {
  outputGameMessage(msg);
});

socket.on("QUE", (msg) => {
  alert(`zaczyna gracz: ${msg}`);
});
// message submit
chatIn.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("clientMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//password submit
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

function outputMessage(message) {
  const div = document.createElement("div");
  //div.classList.add("message");
  div.innerHTML = `<p style = "color:#902dd2";>${message.username}:<span style = "color: black"> ${message.text}</span></p>`;
  document.querySelector(".chat").appendChild(div);
  comparePassword[0] = message.text;
}

async function outputGameMessage(msg) {
  comparePassword[1] = msg;
  const div = document.createElement("div");
  //div.classList.add("message");
  index = [];
  password = [];
  msgg = [...msg];
  for (i = 0; i < msgg.length; i++) {
    password[i] = "_";
    index[i] = i;
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

  for (i = 0; i < 8; i++) {
    flag = false;
    r = Math.floor(Math.random() * msgLen);
    if (
      visiblePassword[index[r]] === "-" ||
      visiblePassword[index[r]] === "<br>"
    ) {
      index[r] = index[msgLen - 1];
      msgLen--;
      i--;
      flag = true;
    }
    if (flag === false) {
      await sleep(2000);
      password[index[r]] = msgg[index[r]];
      index[r] = index[msgLen - 1];
      msgLen--;

      div.innerHTML = `<p> ${visiblePassword}</p>`;
      document.getElementById("gameContainer").appendChild(div);
    }
    //wisielec.innerHTML = `<img src="assets/${i}.png" alt="" />`;
    if (comparePassword[0] === comparePassword[1]) {
      div.innerHTML = `<p> ${msg} poprawne haslo!</p>`;
      document.querySelector(".chat").appendChild(div);
      punkty = punkty + msgLen;
      tabela = document.getElementById("pkt");
      tabela.innerHTML = `<p>${punkty}</p>`;
      socket.emit("koniecTury", "koniec");

      break;
    }
    if (i == 7) {
      div.innerHTML = `<p> Za pozno! Haslo to: ${msg} </p>`;
      document.querySelector(".chat").appendChild(div);
      punkty = punkty - 10;
      tabela = document.getElementById("pkt");
      tabela.innerHTML = `<p>${punkty}</p>`;
      socket.emit("koniecTury", "koniec");
    }
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
