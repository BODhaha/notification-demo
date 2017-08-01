var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 9999;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

let userNumber = 0
io.on('connection', (socket) => {
  console.log('connected')
  
  // 来了一个新用户
  socket.on('add user', (data) => {
    userNumber++
    // 通知其他用户 新来了一个人
    console.log('data: ', data)
    console.log('userNumber: ', userNumber)
    socket.broadcast.emit('user joined', {
      username: data,
      no: userNumber
    })
  })
})