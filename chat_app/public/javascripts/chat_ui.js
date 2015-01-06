(function (root) {
var App = root.App = (root.App || {});

var ChatUi = App.ChatUi = function (chat) {
  this.chat = chat;
  this.$input = $('.user-input input');
};

ChatUi.prototype.getMessage = function () {
  var input = this.$input.val()
  this.$input.val("");

  return input;
};

ChatUi.prototype.sendMessage = function () {
  var message = this.getMessage();

  this.chat.sendMessage(message);
};

ChatUi.prototype.addMessage = function (message) {
  var $li = $('<li>').text(message);

  $('.chat-room').append($li);
};


})(this);

// Note to self: $() is equivalent to $(document).ready()
$(function () {
  var socket = io();
  var chat = new App.Chat(socket);
  var chatUi = new App.ChatUi(chat);

  $('.user-input').on('submit', function (event) {
    event.preventDefault();

    chatUi.sendMessage();
  });

  socket.on('message_distribute', function (data) {
    chatUi.addMessage(data);
  });

});
