const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
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
  socket.on("joinRoom", ({ username, room }) => {
    const user = joinUser(socket.id, username, room);
    console.log({ username, room });
    socket.join(user.room);

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} dolaczyl do gry`)
      );
    if (users.length > 2) {
      socket.broadcast.to(user.room).emit("QUE", getNextUser());
    }

    console.log(getNextUser());
    //send users and room info

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  socket.on("clientPassMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("GamePassword", msg);
  });

  socket.on("clientMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("koniecTury", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("QUE", getNextUser());
  });

  socket.on("disconnect", () => {
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

app.use(express.static(path.join(__dirname, "public")));
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("server nasluchuje"));
