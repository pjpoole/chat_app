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
  this.nicknames[socket.id] =
    ChatServer.GUESTPREFIX + this.guestnumber++;

  var server = this;

  socket.emit('welcome', {
    message: 'Welcome to the chatroom'
  });

  socket.on('message', function (data) {
    ChatServer.prototype.processMessage.call(server, socket, data);
  });

  return;
};

ChatServer.prototype.processMessage = function (socket, data) {
  if (data.slice(0, 1) == '/') {
    this.processCommand(socket, data);
  } else {
    this.messageDistribute(socket, data);
  }

  return;
};

ChatServer.prototype.processCommand = function (socket, data) {
  // (r)egular(e)xpression matching for the first word in the command, or the
  // only word on the line, as well as all followup arguments.
  var re = /^\/(\S*)[\s$](.*)/i;
  var matches = data.match(re);
  var command = matches[1];
  var argData = matches[2];

  switch (command) {
    case "nick":
      this.nicknameChange(socket, argData);
      break;
    default:
      socket.emit('serverError', {
        message: "Invalid command"
      });
      break;
  }

  return;
};

ChatServer.prototype.nicknameChange = function (socket, data) {
  // We don't like whitespace in nicks. Eat the string from beginning to first
  // whitespace.
  var name = data.match(/^(\S*)\s?.*$/)[1];

  if (name.indexOf(ChatServer.GUESTPREFIX) === 0) {
    socket.emit('nicknameChangeResult', {
      success: false,
      message: "Names cannot begin with \"" + ChatServer.GUESTPREFIX + "\""
    });

    return;
  }

  for (var socketid in this.nicknames) {
    if (socketid === socket.id) {
      continue;
    }

    if (this.nicknames[socketid] === name) {
      socket.emit('nicknameChangeResult', {
        success: false,
        message: "Nick taken by existing user."
      });
      return;
    }
  }

  this.nicknames[socketid] = name;

  socket.emit('nicknameChangeResult', {
    success: true
  });

  return;
};

ChatServer.prototype.messageDistribute = function (socket, data) {
  var message = this.parseData(socket, data);

  this.io.emit('message_distribute', message);

  return;
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
