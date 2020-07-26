const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
let readyPlayers = 0;
let numberOfPlayers = 0;
let drawer = "";
const {
  joinUser,
  getCurrentUser,
  getRoomUsers,
  userLeave,
  getNextUser,
  users,
} = require("./utils/users");
const formatMessage = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "bot";

io.on("connection", (socket) => {
  //USER JOIN TO ROOM
  socket.on("joinRoom", ({ username, room, game }) => {
    const user = joinUser(socket.id, username, room, game);
    console.log({ username, room, game });
    socket.join(user.room);

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} joined to room`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    //inicjalizacja punktow dla uzytkownika, ktory sie polaczyl
    io.to(user.room).emit("settingPoints", user.username);
  });
  //przekazanie informacji o punktach innym uzytkownikom
  socket.on("userPointsInfo", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("createNewPointsInDOM", msg);
    io.to(user.room).emit("pointsInDOM", msg);
  });
  //socket sending message to chat from current user to all users
  socket.on("clientMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  //Obsluga zdarzenia gdy 2 osoby zaczna gre
  socket.on("startGame", (msg) => {
    console.log("ready players: ", readyPlayers);
    const user = getCurrentUser(socket.id);
    readyPlayers = readyPlayers + msg;
    drawer = getNextUser();
    if (readyPlayers === 2) {
      //wyslanie osoby, ktora ma zaczac ture
      io.to(user.room).emit("QUE", drawer);
      readyPlayers = 0;
    }
  });
  //wisielec
  //sending to all password information
  socket.on("clientPassMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    numberOfPlayers = 0;
    io.to(user.room).emit("GamePassword", msg);
  });

  //Wiesielec
  //Ending game when one player win
  socket.on("koniecTury", (msg) => {
    const user = getCurrentUser(socket.id);
    drawer = getNextUser();
    socket.broadcast.emit("playerWon", msg);
    io.to(user.room).emit("QUE", drawer);
  });

  //Wisielec
  //ending game when all failed
  socket.on("koniecTuryLoss", (msg) => {
    //numerofplayers jest po to, zeby wylapac pierwszego komu skonczy sie czas i zakonczyc ture
    // w przeciwnym razie wszyscy zglasza koniec tury i funkcja wywola sie 3 razy
    numberOfPlayers++;
    drawer = getNextUser();
    if (numberOfPlayers === 1) {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit("QUE", drawer);
    }
  });
  //wiadomo
  socket.on("resetGame", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("resetGameClient", msg);
  });
  //CZOLKO

  //DISCONNECTION
  socket.on("disconnect", () => {
    const user2 = getCurrentUser(socket.id);
    console.log(user2.username);
    if (user2.username === drawer) {
      io.to(user2.room).emit("QUE", getNextUser());
    }
    socket.broadcast
      .to(user2.room, user2.game)
      .emit("erasePointsfromDOM", user2.username);
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

//twoja stara to stara rura ez
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("server nasluchuje"));
