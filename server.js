const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
let readyPlayers = 0;
let numberOfPlayers = 0;
//elo
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

    //send users and room info
    io.to(user.room, user.game).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    io.to(user.room).emit("settingPoints", user.username);
  });

  socket.on("otherPlayersPoints", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("otherPlayersPointsReceive", msg);
    io.to(user.room).emit("punktyDoTabeli", msg);
  });
  //socket sending message to chat from current user to all users
  socket.on("clientMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room, user.game).emit(
      "message",
      formatMessage(user.username, msg)
    );
  });
  //sending information about user who will start the game
  socket.on("startGame", (msg) => {
    const user = getCurrentUser(socket.id);
    readyPlayers = readyPlayers + msg;
    if (readyPlayers > 1 && readyPlayers < 3) {
      io.to(user.room, user.game).emit("QUE", getNextUser());
    }
  });
  //wisielec
  //sending to all password information
  socket.on("clientPassMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room, user.game).emit("GamePassword", msg);
  });

  //Wiesielec
  //Ending game when one player win
  socket.on("koniecTury", (msg) => {
    const user = getCurrentUser(socket.id);
    socket.broadcast.emit("playerWon", msg);
    io.to(user.room, user.game).emit("QUE", getNextUser());
  });

  //Wisielec
  //ending game when all failed
  socket.on("koniecTuryLoss", (msg) => {
    numberOfPlayers++;
    if (numberOfPlayers === users.length) {
      const user = getCurrentUser(socket.id);
      io.to(user.room, user.game).emit("QUE", getNextUser());
      numberOfPlayers = 0;
    }
  });

  socket.on("resetGame", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("resetGameClient", msg);
  });

  socket.on("punktyGracza", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("punktyDoTabeli", msg);
  });
  //DISCONNECTION
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
