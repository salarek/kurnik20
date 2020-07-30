const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
let readyPlayers = 0;
let readyPlayersCzolko = 0;
let numberOfPlayers = 0;
let drawer = "";
let winnersCzolko = [];
const {
  joinUser,
  getCurrentUser,
  getRoomUsers,
  userLeave,
  getNextUser,
  userAboveUser,
} = require("./utils/users");
const formatMessage = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "BOT";

io.on("connection", (socket) => {
  //USER JOIN TO ROOM
  socket.on("joinRoom", ({ username, room, game }) => {
    socket.on("gameInfo", (game) => {
      const user = joinUser(socket.id, username, room, game);
      console.log({ username, room, game });
      socket.join(user.room);

      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user.username} Dolaczyl(a) do gry!`)
        );

      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room, game),
      });
      //inicjalizacja punktow dla uzytkownika, ktory sie polaczyl
      io.to(user.room).emit("settingPoints", user.username);
    });
  });
  socket.on("gameInfo", (game) => {
    //przekazanie informacji o punktach innym uzytkownikom
    socket.on("userPointsInfo", (msg) => {
      const user = getCurrentUser(socket.id, game);
      io.to(user.room).emit("createNewPointsInDOM", msg);
      io.to(user.room).emit("pointsInDOM", msg);
    });
    //socket sending message to chat from current user to all users
    socket.on("clientMessage", (msg) => {
      const user = getCurrentUser(socket.id, game);
      io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
    //Obsluga zdarzenia gdy 2 osoby zaczna gre
    socket.on("startGame", (msg) => {
      console.log("ready players: ", readyPlayers);
      const user = getCurrentUser(socket.id, game);
      readyPlayers = readyPlayers + msg;
      drawer = getNextUser(game);
      if (readyPlayers === 2) {
        //wyslanie osoby, ktora ma zaczac ture
        io.to(user.room).emit("QUE", drawer);
        readyPlayers = 0;
      }
    });
    //wisielec
    //sending to all password information
    socket.on("clientPassMessage", (msg) => {
      const user = getCurrentUser(socket.id, game);
      numberOfPlayers = 0;
      io.to(user.room).emit("GamePassword", msg);
    });

    //Wiesielec
    //Ending game when one player win
    socket.on("koniecTury", (msg) => {
      const user = getCurrentUser(socket.id, game);
      drawer = getNextUser(game);
      socket.broadcast.emit("playerWon", msg);
      io.to(user.room).emit("QUE", drawer);
    });

    //Wisielec
    //ending game when all failed
    socket.on("koniecTuryLoss", (msg) => {
      //numerofplayers jest po to, zeby wylapac pierwszego komu skonczy sie czas i zakonczyc ture
      // w przeciwnym razie wszyscy zglasza koniec tury i funkcja wywola sie 3 razy
      numberOfPlayers++;
      drawer = getNextUser(game);
      if (numberOfPlayers === 1) {
        const user = getCurrentUser(socket.id, game);
        io.to(user.room).emit("QUE", drawer);
      }
    });
    //wiadomo
    socket.on("resetGame", (msg) => {
      const user = getCurrentUser(socket.id, game);
      io.to(user.room).emit("resetGameClient", msg);
    });
    //CZOLKO
    socket.on("startGameCzolko", (msg) => {
      console.log("ready playersCzolko: ", readyPlayersCzolko);
      const user = getCurrentUser(socket.id, game);
      readyPlayersCzolko = readyPlayersCzolko + 1;

      if (readyPlayersCzolko === 2) {
        //wyslanie osoby, ktora ma zaczac ture
        io.to(user.room).emit("RoundStart");
        readyPlayersCzolko = 0;
      }
    });
    socket.on("passwordForNextUser", (msg) => {
      const user = getCurrentUser(socket.id, game);
      const nextUser = userAboveUser(socket.id, game);
      io.to(user.room).emit("passwordReceive", nextUser, msg);
      readyPlayersCzolko++;
      if (readyPlayersCzolko == 2) {
        io.to(user.room).emit("QUE", getNextUser(game));
        readyPlayersCzolko = 0;
      }
    });
    socket.on("sendQuestion", (msg) => {
      console.log(msg);
      const user = getCurrentUser(socket.id, game);
      io.to(user.room).emit("questionShow", msg);
    });

    socket.on("endQuestion", (msg) => {
      if (msg) {
        const user = getCurrentUser(socket.id, game);
        winnersCzolko.push(msg.username);
        socket.broadcast.to(user.room).emit("winner", msg, user.username);
      }
      nextUser = getNextUser(game);
      let ind = winnersCzolko.findIndex((win) => win === nextUser.username);
      console.log(`INDEX: ${ind}`);
      if (ind >= 0) {
        nextUser = getNextUser(game);
        console.log(nextUser.username);
      }

      const user = getCurrentUser(socket.id, game);
      io.to(user.room).emit("QUE", nextUser);
    });

    //DISCONNECTION
    socket.on("disconnect", () => {
      const user2 = getCurrentUser(socket.id, game);
      console.log(user2.username);
      if (user2.username === drawer) {
        io.to(user2.room).emit("QUE", getNextUser(game));
      }
      socket.broadcast
        .to(user2.room, user2.game)
        .emit("erasePointsfromDOM", user2.username);
      const user = userLeave(socket.id, game);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room, game),
        });
      }
    });
  });
});

//twoja stara to stara rura ez
app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("server nasluchuje"));
