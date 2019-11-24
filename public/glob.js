var myVideoArea = document.querySelector("#myVideoTag");
var modal = document.querySelector(".modal");
var username = document.querySelector("#username")
var peername = makeid(5);
var videos = document.querySelector(".videos");
var myMessage = document.querySelector("#myMessage");
var sendMessage = document.querySelector("#sendMessage");
var chatArea = document.querySelector("#chatArea");
var signalingArea = document.querySelector("#signalingArea");

var configuration = {
	'iceServers': [{
	  'urls': 'stun:stun.l.google.com:19302'
	}]
};

  function joinroom () {
  	console.log(username.value)
  	modal.classList.remove("is-active");
  	document.querySelector(".hero-title").innerHTML = `Hi, ${username.value}`
  	document.querySelector(".hero-subtitle").innerHTML = "you're in room: classroom"
  }

  function getdups (str) {
   return peers.filter(function(value){
        return value === str;
    }).length 
  }

  function displayMessage(message, onSelf = false) {
  	if(onSelf)
	    chatArea.innerHTML = chatArea.innerHTML + "<p style = 'color:#592851;text-align:right;width:100%;'>" + message + "</p>";
	else
	    chatArea.innerHTML = chatArea.innerHTML + "<p style = 'color:#592851;width:100%;'>" + message + "</p>";
  }
  function displaySignalMessage(message) {
    signalingArea.innerHTML = signalingArea.innerHTML + "<br/>" + message;
  }
  function logError(error) {
    displaySignalMessage(error.name + ': <span style= "color:red">' + error.message + '</span>');
  }

  function sendLocalDesc(desc) {
    rtcPeerConn.setLocalDescription(desc, function () {
      io.emit('signal',{"type":"SDP", peerID: peername, "message": JSON.stringify({ 'sdp': rtcPeerConn.localDescription }), "room":SIGNAL_ROOM, });
    }, logError);
  }

  function makeid(length) {
     var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }

  function createVideo (stream) {
    var video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.className = "videoContent column";
    videos.appendChild(video);
    video.load();
  }