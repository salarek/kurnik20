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
  const msg = e.target.elements.password.value;
  socket.emit("clientPassMessage", msg);
  e.target.elements.password.value = "";
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
  for (i = 0; i < msg.length; i++) {
    password[i] = "_";
    index[i] = i;
  }
  for (j = 0; j < msg.length; j++) {
    if (msg[j] === " ") {
      password[j] = "-";
    }
  }
  div.innerHTML = `<p> ${password}</p>`;
  document.querySelector(".game").appendChild(div);
  msgLen = msg.length;

  for (i = 0; i < 8; i++) {
    r = Math.floor(Math.random() * msgLen);
    if (index[r] === "-") {
      r = Math.floor(Math.random() * msgLen);
    }
    await sleep(2000);
    password[index[r]] = msg[index[r]];
    index[r] = index[msgLen - 1];
    msgLen--;
    div.innerHTML = `<p> ${password}</p>`;
    document.querySelector(".game").appendChild(div);
    wisielec.innerHTML = `<img src="assets/${i}.png" alt="" />`;
    if (comparePassword[0] === comparePassword[1]) {
      div.innerHTML = `<p> ${msg} poprawne haslo!</p>`;
      document.querySelector(".game").appendChild(div);
      punkty = punkty + msgLen;
      tabela = document.getElementById("pkt");
      tabela.innerHTML = `<p>${punkty}</p>`;

      break;
    }
    if (i == 7) {
      div.innerHTML = `<p> Za pozno! Halo to: ${msg} </p>`;
      document.querySelector(".game").appendChild(div);
      punkty = punkty - 10;
      tabela = document.getElementById("pkt");
      tabela.innerHTML = `<p>${punkty}</p>`;
    }
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
