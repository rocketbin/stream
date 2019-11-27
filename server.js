var express    = require('express.io');
var bodyParser = require('body-parser');
var cors       = require("cors");
var app        = express();
app.http().io();
const PORT = process.env.PORT || 3001;
var cls = [];
console.log("server started on port: " + PORT)
//setup cors accept * from * method
app.all('*', function(req, res, next) {
    res.header("Accept", "*");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE");
    next();
});
// var server  = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));
app.get("/", function (req, res){
  res.render("index.ejs");
});
app.get("/tops", function (req, res){
  res.render("top.ejs");
});

app.get("/connect", function (req, res){
  res.write("100");
});

// server.listen(3000, '192.168.254.110');
app.io.route('connect', function(req) {
  req.io.join("connect").on("disconnect", function(data) {
  req.io.room("connect").broadcast('announce', {
    message: "connected"
  });
});
});

app.io.route('ready', function(req) {
  req.io.join(req.data.chat_room).on("disconnect", function(data) {
    req.io.room(req.data.room).broadcast("message", {
      author: "SYSTEM",
      message: "PEER: " + req.data.peer + " has left the room"
    })
  })
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

app.io.route('push_offer', function(req) {
  req.io.room(req.data.room).broadcast('signaling_message', {
    type: req.data.type,
    peerID: req.data.peerID,
    message: req.data.message
  });
})

app.io.route('signal', function(req) {
  cls = [];
  app.io.sockets.clients(req.data.room).filter(c => c.disconnected === false).map(s => {
    if(s.dataSyn !== undefined && s.dataSyn.peerID !== req.data.peerID) {
        cls.push(s.dataSyn)
    } else {
      s.dataSyn = {peerID: req.data.peerID, skt: s.id, peerInstance: false};
      cls.push({peerID: req.data.peerID, skt: s.id, peerInstance: false})
    }
  })
  req.io.room(req.data.room).broadcast('signaling_message', {
        type: req.data.type,
        peerID: req.data.peerID,
        message: req.data.message,
        cls,
    });

    req.io.room(req.data.room).broadcast("push_offer", {
      offType: req.data
    });
    req.io.room(req.data.room).broadcast("ice_candidate", {
      offType: req.data
    });
    req.io.room(req.data.room).broadcast("push_answer", {
      offType: req.data
    });
})
app.listen(PORT);