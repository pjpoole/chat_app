var http, static, chat, file, server;

http = require('http');
static = require('node-static');
chat = require('./chat_server');


file = new static.Server('./public');

server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

server.listen(8080);

chat.createChat(server);
