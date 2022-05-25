import h from "./helpers.js";
import Socket from "./constants.js";
const SOCKET_HOST = Socket.local;

let mediaRecorder;
let uploadUrl;
let socket;
var myStream = "";
var pc = [];
var socketId = "";
var randomNumber = `__${h.generateRandomString()}__${h.generateRandomString()}__`;

async function recordScreen() {
  return await navigator.mediaDevices.getDisplayMedia({
    audio: true,
    video: { mediaSource: "screen" },
  });
}

function createRecorder(stream, mimeType) {
  // the stream data is stored in this array
  let recordedChunks = [];

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.onstop = function () {
    saveFile(recordedChunks);
    recordedChunks = [];
  };
  mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}

function saveFile(recordedChunks) {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });
  console.log(blob);
  fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
    },
    body: blob,
  });
}

document.getElementById("video-container").style.display = "none";

window.initRtc = () => {
  console.log("----------init rtc---------");
  getAndSetUserStream();
  socket = window.io.connect(SOCKET_HOST);
  document.getElementById("video-container").style.display = "block";
  const uid = localStorage.getItem("uid");
  const kanbanId = localStorage.getItem("kanbanId");
  socket.emit("get room", { uid, kanbanId });
  socket.emit("join room", kanbanId);
  socket.on("connect", () => {
    //set socketId
    socketId = socket.io.engine.id;

    socket.emit("subscribe", {
      room: kanbanId,
      socketId: socketId,
    });

    socket.on("new user", (data) => {
      socket.emit("newUserStart", { to: data.socketId, sender: socketId });
      init(true, data.socketId);
    });

    socket.on("user left", (data) => {
      delete pc[data.sender];
      document.getElementById(data.sender).remove();
      console.log(document.getElementById(data.sender))
      console.log(pc)
    });

    socket.on("newUserStart", (data) => {
      init(false, data.sender);
    });

    socket.on("ice candidates", async (data) => {
      data.candidate
        ? await pc[data.sender].addIceCandidate(
            new RTCIceCandidate(data.candidate)
          )
        : "";
    });

    socket.on("sdp", async (data) => {
      if (data.description.type === "offer") {
        data.description
          ? await pc[data.sender].setRemoteDescription(
              new RTCSessionDescription(data.description)
            )
          : "";

        h.getUserFullMedia()
          .then(async (stream) => {
            if (!document.getElementById("rtc").srcObject) {
              h.setLocalStream(stream);
            }

            //save my stream
            myStream = stream;

            stream.getTracks().forEach((track) => {
              pc[data.sender].addTrack(track, stream);
            });

            let answer = await pc[data.sender].createAnswer();

            await pc[data.sender].setLocalDescription(answer);

            socket.emit("sdp", {
              description: pc[data.sender].localDescription,
              to: data.sender,
              sender: socketId,
            });
          })
          .catch((e) => {
            console.error(e);
          });
      } else if (data.description.type === "answer") {
        await pc[data.sender].setRemoteDescription(
          new RTCSessionDescription(data.description)
        );
      }
    });
  });

  function getAndSetUserStream() {
    h.getUserFullMedia()
      .then((stream) => {
        //save my stream
        myStream = stream;

        h.setLocalStream(stream);
      })
      .catch((e) => {
        console.error(`stream error: ${e}`);
      });
  }

  function init(createOffer, partnerName) {
    pc[partnerName] = new RTCPeerConnection(h.getIceServer());

    if (myStream) {
      myStream.getTracks().forEach((track) => {
        pc[partnerName].addTrack(track, myStream); //should trigger negotiationneeded event
      });
    } else {
      h.getUserFullMedia()
        .then((stream) => {
          //save my stream
          myStream = stream;

          stream.getTracks().forEach((track) => {
            pc[partnerName].addTrack(track, stream); //should trigger negotiationneeded event
          });

          h.setLocalStream(stream);
        })
        .catch((e) => {
          console.error(`stream error: ${e}`);
        });
    }

    //create offer
    if (createOffer) {
      pc[partnerName].onnegotiationneeded = async () => {
        let offer = await pc[partnerName].createOffer();

        await pc[partnerName].setLocalDescription(offer);

        socket.emit("sdp", {
          description: pc[partnerName].localDescription,
          to: partnerName,
          sender: socketId,
        });
      };
    }

    //send ice candidate to partnerNames
    pc[partnerName].onicecandidate = ({ candidate }) => {
      socket.emit("ice candidates", {
        candidate: candidate,
        to: partnerName,
        sender: socketId,
      });
    };

    //add
    pc[partnerName].ontrack = (e) => {
      let str = e.streams[0];
      if (document.getElementById(`${partnerName}-video`)) {
        document.getElementById(`${partnerName}-video`).srcObject = str;
      } else {
        //video elem
        let newVid = document.createElement("video");
        newVid.id = `${partnerName}-video`;
        newVid.srcObject = str;
        newVid.autoplay = true;
        newVid.className = "remote-video";

        //video controls elements
        let controlDiv = document.createElement("div");
        controlDiv.className = "remote-video-controls";
        //         controlDiv.innerHTML = `<i class="fa fa-microphone text-white pr-3 mute-remote-mic" title="Mute"></i>
        //                           <i class="fa fa-expand text-white expand-remote-video" title="Expand"></i>`;

        //create a new div for card
        let cardDiv = document.createElement("div");
        cardDiv.className = "video-div";
        cardDiv.id = partnerName;
        cardDiv.appendChild(newVid);
        cardDiv.appendChild(controlDiv);

        //put div in main-section elem
        document.getElementById("video-container").appendChild(cardDiv);

        h.adjustVideoElemSize();
      }
    };

    pc[partnerName].onconnectionstatechange = (d) => {
      switch (pc[partnerName].iceConnectionState) {
        case "disconnected":
        case "failed":
          h.closeVideo(partnerName);
          break;

        case "closed":
          h.closeVideo(partnerName);
          break;
      }
    };

    pc[partnerName].onsignalingstatechange = (d) => {
      switch (pc[partnerName].signalingState) {
        case "closed":
          console.log("Signalling state is 'closed'");
          h.closeVideo(partnerName);
          break;
      }
    };
  }

  function broadcastNewTracks(stream, type, mirrorMode = true) {
    h.setLocalStream(stream, mirrorMode);

    let track =
      type == "audio" ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];

    for (let p in pc) {
      let pName = pc[p];

      if (typeof pc[pName] == "object") {
        h.replaceTrack(track, pc[pName]);
      }
    }
  }

  //When the video icon is clicked
  //   document.getElementById("toggle-video").addEventListener("click", (e) => {
  //     e.preventDefault();
  //
  //     let elem = document.getElementById("toggle-video");
  //
  //     if (myStream.getVideoTracks()[0].enabled) {
  //       e.target.classList.remove("fa-video");
  //       e.target.classList.add("fa-video-slash");
  //       elem.setAttribute("title", "Show Video");
  //
  //       myStream.getVideoTracks()[0].enabled = false;
  //     } else {
  //       e.target.classList.remove("fa-video-slash");
  //       e.target.classList.add("fa-video");
  //       elem.setAttribute("title", "Hide Video");
  //
  //       myStream.getVideoTracks()[0].enabled = true;
  //     }
  //
  //     broadcastNewTracks(myStream, "video");
  //   });

  //When the mute icon is clicked
  //   document.getElementById("toggle-mute").addEventListener("click", (e) => {
  //     e.preventDefault();
  //
  //     let elem = document.getElementById("toggle-mute");
  //
  //     if (myStream.getAudioTracks()[0].enabled) {
  //       e.target.classList.remove("fa-microphone-alt");
  //       e.target.classList.add("fa-microphone-alt-slash");
  //       elem.setAttribute("title", "Unmute");
  //
  //       myStream.getAudioTracks()[0].enabled = false;
  //     } else {
  //       e.target.classList.remove("fa-microphone-alt-slash");
  //       e.target.classList.add("fa-microphone-alt");
  //       elem.setAttribute("title", "Mute");
  //
  //       myStream.getAudioTracks()[0].enabled = true;
  //     }
  //
  //     broadcastNewTracks(myStream, "audio");
  //   });
};

window.closeRtc = () => {
  console.log("----------close rtc---------");
  document.getElementById("video-container").style.display = "none";
  const uid = localStorage.getItem("uid");
  const kanbanId = localStorage.getItem("kanbanId");
  socket.emit("leave room", { uid, kanbanId });
  socket.emit("leave meet", kanbanId);
  socket.emit("user left", { room: kanbanId, sender: socketId });
  socket.disconnect();
  pc = [];
  if (myStream.getTracks()) {
    myStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  document.querySelectorAll(".video-div").forEach((video) => {
    if (video.id !== "myVideo-div") video.remove();
  });
};
