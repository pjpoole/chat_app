function ChatServer(server) {
  this.server = server;
  this.io = require('socket.io')(this.server);

  this.io.on('connection', this.userConnect.bind(this));

  this.guestnumber = 0;
  this.nicknames = {};
};

ChatServer.prototype.userConnect = function (socket) {
  this.nicknames[socket.id] = "guest" + this.guestnumber++;

  var server = this;

  socket.emit('welcome', {
    message: 'Welcome to the chatroom'
  });

  socket.on('message', function (data) {
    ChatServer.prototype.messageDistribute.call(server, socket, data);
  });
};

ChatServer.prototype.messageDistribute = function (socket, data) {
  var message = this.parseData(socket, data);

  this.io.emit('message_distribute', message);
};

ChatServer.prototype.parseData = function (socket, data) {
  var nick = this.nicknames[socket.id];
  var message = {};

  message["message"] = data;
  message["nick"] = nick;

  return message;
};

exports.ChatServer = ChatServer;
