function ChatServer(server) {
  this.server = server;
  this.io = require('socket.io')(this.server);

  this.guestnumber = 0;
  this.nicknames = {};

  var self = this;

  this.io.on('connection', self.userConnect.bind(this));
  this.io.on('nicknameChangeRequest', self.nicknameChange);
};

ChatServer.GUESTPREFIX = "guest";

ChatServer.prototype.userConnect = function (socket) {
  console.log(socket.id);

  this.nicknames[socket.id] =
    ChatServer.GUESTPREFIX + this.guestnumber++;

  var server = this;

  socket.emit('welcome', {
    message: 'Welcome to the chatroom'
  });

  socket.on('message', function (data) {
    server.processMessage.call(server, socket, data);
  });
};

ChatServer.prototype.processMessage = function (socket, data) {
  if (data.slice(0, 1) == '/') {
    this.processCommand(socket, data);
  } else {
    this.messageDistribute(socket, data);
  }
};

ChatServer.prototype.processCommand = function (socket, data) {

  // (r)egular(e)xpression matching for the first word in the command, or the
  // only word on the line, as well as all followup arguments.
  var re = /^\/(\S*)\s?(.*)$/;
  var matches = data.match(re);

  // I'm not sure why, but I can't get array-like indexing to work here.
  var command = matches[1]; // .shift().toString();
  var argData = matches[2]; // .shift();

  switch (command) {
    case "nick":
      this.nicknameChange(socket, argData);
      break;
    default:
      socket.emit('server_error', {
        message: "Invalid command"
      });
      break;
  }
};

ChatServer.prototype.nicknameChange = function (socket, data) {
  // We don't like whitespace in nicks. Eat the string from beginning to first
  // whitespace.
  var name = data.match(/^(\S*)\s?.*$/)[1];

  console.log(data, name);

  if (name.indexOf(ChatServer.GUESTPREFIX) === 0) {
    socket.emit('nickname_change_result', {
      success: false,
      message: "Names cannot begin with \"" + ChatServer.GUESTPREFIX + "\""
    });

    return;
  }

  for (var socketid in this.nicknames) {
    console.log(socketid, this.nicknames[socketid]);
    if (socketid === socket.id) {
      continue;
    }

    if (this.nicknames[socketid] === name) {
      socket.emit('nickname_change_result', {
        success: false,
        message: "Nick taken by existing user."
      });
      return;
    }
  }

  this.nicknames[socket.id] = name;

  socket.emit('nickname_change_result', {
    success: true,
    name: name
  });
};

ChatServer.prototype.messageDistribute = function (socket, data) {
  var message = this.parseData(socket, data);

  this.io.emit('message_distribute', message);
};

ChatServer.prototype.parseData = function (socket, data) {
  var nick = this.nicknames[socket.id];
  var message = {};
  var time = Date.now();

  message["time"] = time;
  message["message"] = data;
  message["nick"] = nick;

  return message;
};

exports.ChatServer = ChatServer;
