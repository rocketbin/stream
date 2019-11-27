var peername = makeid(12);
var videos = document.querySelector(".videos");
var configuration = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

function removeSelf(arr) {
  return arr.filter(arr => arr.peerID !== peername);
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


function startStreaming(peerInstance, peerID) {
  peerInstance = new  RTCPeerConnection(configuration);
  peerInstance.onicecandidate = function (evt) {
    if (evt.candidate)
      io.emit('signal',{"type":"ice_candidate",peerID: peername,  'candidate': JSON.stringify(evt.candidate), peerInstance:false});
  };

  peerInstance.onnegotiationneeded = () => {
    negotiateOffer(peerInstance).then(r => {
      console.log("@needing negot", r)
      io.emit('signal',{offer:JSON.stringify({ 'sdp': r }), type:"push_offer", peerInstance:false, peerID: peername});
    })
  }

  peerInstance.ontrack = function(evt) {
    console.log("receiving data from peers", evt);
    createVideo(evt.streams[0])
  }

  navigator.mediaDevices.getUserMedia({"audio": false, "video": true}).then(stream => {
    myVideoArea.srcObject = stream;
    peerInstance.addStream(stream);
  })
  return peerInstance
}

function negotiateOffer(isntance) {
    return isntance.createOffer()
    .then(sdp => isntance.setLocalDescription(sdp))
    .then(()=> {
      return isntance.localDescription
        // io.emit('onOffer', {offer: peerInstance.localDescription, peerID: peername, skt, peerCon});
    })
}

// function makeOffer (skt, peername) {
//   return new Promise((resolve, reject) => {
//     let peerCon = new RTCPeerConnection();
//     peerCon.onnegotiationneeded = function () {
//       peerCon.createOffer(sendLocalDesc, logError);
//     }
//     var constraints = { 'audio': false, 'video': true };
//     navigator.mediaDevices.getUserMedia(constraints).then(stream => {
//       myVideoArea.srcObject = stream;
//       peerCon.addStream(stream);
//       peerCon.createOffer()
//       .then(sdp => peerCon.setLocalDescription(sdp))
//       .then(function() {
//           let ld = peerCon.localDescription;
//           resolve({offer: ld, peerID: peername, skt, peerCon});
//         })
//       })
//   });
// }

