var createChat = function (server) {
  var io  = require('socket.io')(server);

  io.on('connection', function (socket) {
    socket.emit('welcome', {
      message: 'Welcome to the tiny chat room'
    });

    socket.on('message', function (data) {
      // var message = parseMessage(data);
      io.emit('message_distribute', data);
    });
  });
};


exports.createChat = createChat;
