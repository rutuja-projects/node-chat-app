"use strict";

var users = [];

var adduser = function adduser(_ref) {
  var id = _ref.id,
      username = _ref.username,
      room = _ref.room;
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'username and room must  required!!'
    };
  }

  var existinguser = users.find(function (user) {
    return user.room === room && user.username === username;
  });

  if (existinguser) {
    return {
      error: 'user is in use!!'
    };
  }

  var user = {
    id: id,
    username: username,
    room: room
  };
  users.push(user);
  return {
    user: user
  };
};

var removeuser = function removeuser(id) {
  var index = users.findIndex(function (user) {
    return user.id === id;
  });

  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

var getuser = function getuser(id) {
  return users.find(function (user) {
    return user.id === id;
  });
};

var getuserinroom = function getuserinroom(room) {
  room = room.trim().toLowerCase();
  return users.filter(function (user) {
    return user.room === room;
  });
};

module.exports = {
  adduser: adduser,
  removeuser: removeuser,
  getuser: getuser,
  getuserinroom: getuserinroom
};