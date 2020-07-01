const users = [];
let i = 0;
function joinUser(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getNextUser() {
  i++;
  if (i > users.length - 1) {
    i = 0;
  }
  return `${users[i].username}`;
}
module.exports = {
  joinUser,
  getCurrentUser,
  getRoomUsers,
  userLeave,
  getNextUser,
  users,
};
