const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
let readyPlayers = 0;
let numberOfPlayers = 0;
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
    socket.join(user.game);

    socket.broadcast
      .to(user.room, user.game)
      .emit(
        "message",
        formatMessage(botName, `${user.username} dolaczyl do gry`)
      );

    console.log(getNextUser());
    //send users and room info

    io.to(user.room, user.game).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("clientMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room, user.game).emit(
      "message",
      formatMessage(user.username, msg)
    );
  });

  socket.on("startGame", (msg) => {
    const user = getCurrentUser(socket.id);
    readyPlayers = readyPlayers + msg;
    if (readyPlayers > 1 && readyPlayers < 3) {
      io.to(user.room, user.game).emit("QUE", getNextUser());
    }
  });
  //wisielec
  socket.on("clientPassMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room, user.game).emit("GamePassword", msg);
  });

  //Wiesielec
  socket.on("koniecTury", (msg) => {
    const user = getCurrentUser(socket.id);
    socket.broadcast.emit("playerWon", msg);
    io.to(user.room, user.game).emit("QUE", getNextUser());
  });

  //Wisielec
  socket.on("koniecTuryLoss", (msg) => {
    numberOfPlayers++;
    if (numberOfPlayers === users.length) {
      const user = getCurrentUser(socket.id);
      io.to(user.room, user.game).emit("QUE", getNextUser());
      numberOfPlayers = 0;
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room, user.game).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room, user.game).emit("roomUsers", {
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
