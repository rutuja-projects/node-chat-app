"use strict";

var path = require('path');

var http = require('http');

var express = require('express');

var socketio = require('socket.io');

var Filter = require('bad-words');

var _require = require('./utils/messages'),
    generatemessage = _require.generatemessage,
    generatelocation = _require.generatelocation;

var _require2 = require('./utils/users'),
    adduser = _require2.adduser,
    removeuser = _require2.removeuser,
    getuser = _require2.getuser,
    getuserinroom = _require2.getuserinroom;

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var port = process.env.PORT || 3000;
var publicdirectorypath = path.join(__dirname, '../public');
app.use(express["static"](publicdirectorypath));
io.on('connection', function (socket) {
  console.log('new websocket connection');
  socket.on('join', function (_ref, callback) {
    var username = _ref.username,
        room = _ref.room;

    var _adduser = adduser({
      id: socket.id,
      username: username,
      room: room
    }),
        error = _adduser.error,
        user = _adduser.user;

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit('message', generatemessage('Admin', 'Welcome!!'));
    socket.broadcast.to(user.room).emit('message', generatemessage('Admin', "".concat(user.username, " has joined!!")));
    io.to(user.room).emit('roomdata', {
      room: user.room,
      users: getuserinroom(user.room)
    });
    callback();
  });
  socket.on('sendmessage', function (message, callback) {
    var user = getuser(socket.id);
    var filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('profanity is not allowed');
    }

    io.to(user.room).emit('message', generatemessage(user.username, message));
    callback();
  });
  socket.on('sendLocation', function (coords, callback) {
    var user = getuser(socket.id);
    io.to(user.room).emit('locationmessage', generatelocation(user.username, "https://google.com/maps?q=".concat(coords.latitude, ",").concat(coords.longitude)));
    callback();
  });
  socket.on('disconnect', function () {
    var user = removeuser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generatemessage('Admin', "".concat(user.username, " has left!!")));
      io.to(user.room).emit('roomdata', {
        room: user.room,
        users: getuserinroom(user.room)
      });
    }
  });
});
server.listen(port, function () {
  console.log("server is up on port ".concat(port));
});