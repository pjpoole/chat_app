(function (root) {
var App = root.App = (root.App || {});

var Chat = App.Chat = function (socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function (message) {
  this.socket.emit('message', message);
};

})(this);
