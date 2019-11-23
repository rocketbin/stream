var express = require('express.io');
var app     = express();
app.http().io();
var PORT = 3000;
console.log("server started on port: " + PORT)
// var server  = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));
app.get("/", function (req, res){
  res.render("index.ejs");
});

// server.listen(3000, '192.168.254.110');
app.io.route('ready', function(req) {
  req.io.join(req.data.chat_room)
  req.io.join(req.data.signal_room);
  req.io.room(req.data).broadcast('announce', {
    message: 'New client in the '+ req.data.signal_room+' room.'
  });
})

app.io.route('send', function(req) {
    app.io.room(req.data.room).broadcast('message', {
        message: req.data.message,
        author: req.data.author
    });
})
app.io.route('signal', function(req) {
  //Note the use of req here for broadcasting so only the sender doesn't receive their own messages
  req.io.room(req.data.room).broadcast('signaling_message', {
        type: req.data.type,
        message: req.data.message
    });
})
app.listen(PORT);