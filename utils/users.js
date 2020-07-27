const wisielec = [];
const czolko = [];
let i = 0;
function joinUser(id, username, room, game) {
  const user = { id, username, room, game };
  if (game === "wisielec") {
    wisielec.push(user);
    return user;
  }
  if (game === "czolko") {
    czolko.push(user);
    return user;
  }
}

function getCurrentUser(id, game) {
  if (game === "wisielec") return wisielec.find((user) => user.id === id);
  if (game === "czolko") return czolko.find((user) => user.id === id);
}
function getRoomUsers(room, game) {
  if (game === "wisielec") return wisielec.filter((user) => user.room === room);
  if (game === "czolko") return czolko.filter((user) => user.room === room);
}

function userLeave(id, game) {
  if (game === "wisielec") {
    const index = wisielec.findIndex((user) => user.id === id);

    if (index !== -1) {
      return wisielec.splice(index, 1)[0];
    }
  }
  if (game === "czolko") {
    const index = wisielec.findIndex((user) => user.id === id);
    if (index !== -1) {
      return czolko.splice(index, 1)[0];
    }
  }
}

function getNextUser(game) {
  if (game === "wisielec") {
    for (z = 0; z < wisielec.length; z++) {
      console.log(`uzytkownik: ${z}`, wisielec[z].username);
    }
    i++;
    console.log(i);
    if (i === wisielec.length || i >= wisielec.length) {
      i = 0;
    }

    return `${wisielec[i].username}`;
  }
  if (game === "czolko") {
    for (z = 0; z < czolko.length; z++) {
      console.log(`uzytkownik: ${z}`, czolko[z].username);
    }
    i++;
    console.log(i);
    if (i === czolko.length || i >= czolko.length) {
      i = 0;
    }

    return `${czolko[i].username}`;
  }
}
module.exports = {
  joinUser,
  getCurrentUser,
  getRoomUsers,
  userLeave,
  getNextUser,
};
