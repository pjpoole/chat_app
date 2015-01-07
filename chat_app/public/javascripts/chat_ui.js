(function (root) {
var App = root.App = (root.App || {});

var ChatUi = App.ChatUi = function (chat) {
  this.chat = chat;
  this.$input = $('.user-input input');
  this.$chatRoom = $('.chat-room');
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
  var $li = $('<li>'),
      $nick = $('<strong>').text(message.nick).append(": ");

  $li.text(message.message).prepend($nick);

  this.$chatRoom.append($li);
};

ChatUi.prototype.renderError = function (message) {
  var $li = $('<li>'),
      $em = $('<em>').append('error: ').append(message.get("message"));

  $li.html($em);

  this.$chatRoom.append($li);
};

ChatUi.prototype.handleNickSuccess = function (data) {
  var $li = $('<li>'),
      $em = $('<em>').append('Nick changed to ').append(data.get("name"));

  $li.html($em);

  this.$chatRoom.append($li);
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

  socket.on('server_error', function (data) {
    chatUi.renderError(data);
  });

  socket.on('nickname_change_result', function (data) {
    if (data.get("success")) {
      chatUi.handleNickSuccess(data);
    } else {
      chatUi.renderError(data);
    }
  });

});
