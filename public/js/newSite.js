const { username, room, game } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("joinRoom", { username, room, game });

socket.on("message", (message) => {
  console.log(username);
});
