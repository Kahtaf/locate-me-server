// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('SEND_LOCATION_UPDATE', function (data) {
    // we tell the client to execute 'new message'
    console.log(data);
    //socket.broadcast.emit
    socket.emit('RECEIVE_LOCATION_UPDATE', {
      username: data.username,
      latitude: data.latitude,
      longitude: data.longitude
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('ADD_USER', function (username) {
  	console.log(username);
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;

    //socket.broadcast.emit
    socket.emit('USER_JOINED', {
    	username: username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});