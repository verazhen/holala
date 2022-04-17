let mySocketId;
let counter = 1;

const config = {
  iceServers: [
    {
      urls: "stun:stun.stunprotocol.org",
    },
  ],
};

const peer = {};

async function init(
  setVideo,
  userVideo,
  ws,
  remoteVideos,
  setRemoteVideos,
  remoteVideoRef1,
  remoteVideoRef2
) {
  //開啟webcam並投播
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });

  setVideo(stream);
  console.log(userVideo.current)
  if (userVideo.current) {
    userVideo.current.srcObject = stream;
  }

  //建立首次上行連線 and broadcast
  peer["server"] = new RTCPeerConnection(config);
  peer["server"].onconnectionstatechange = (e) => { console.log("onconnectionstatechange as sender=> ",e.currentTarget.connectionState)};
  peer["server"].onnegotiationneeded = () => sendOffer(peer["server"], ws); //onnegotiationneeded=> 每當 RTCPeerConnection 要進行會話溝通(連線)時，第一次是在addTrack後會觸發
  stream.getTracks().forEach((track) => {
    peer["server"].addTrack(track, stream);
  });

  ws.on("getBroadcast", ({ desc, offerId }) => {
    console.log("get answer from server => ", desc);
    mySocketId = offerId;
    const remoteDesc = new RTCSessionDescription(desc);
    peer["server"]
      .setRemoteDescription(remoteDesc)
      .catch((e) => console.log(e));
  });

  //listen when anyone is add in the room
  ws.on("signal", async ({ desc, offerId, answerId, event }) => {
    console.log("my socket id is => ", mySocketId);
//     console.log("收到sdp協議 => ", desc.sdp);
    let broadcaster;

    if (event === "newUser") {
      broadcaster = offerId;
      console.log(`有新用戶${broadcaster} 加入房間，取得新用戶stream`);
    } else if (event === "oldStream") {
      broadcaster = answerId;
      console.log(`獲取舊用戶stream:${broadcaster}`);
    }

    peer[broadcaster] = new RTCPeerConnection(config);
    peer[broadcaster].onconnectionstatechange = (e) => { console.log("onconnectionstatechange as receiver=> ",e.currentTarget.connectionState)};
    const remoteDesc = new RTCSessionDescription(desc);
    peer[broadcaster]
      .setRemoteDescription(remoteDesc)
      .catch((e) => console.log(e));
    peer[broadcaster].ontrack = (e) =>
      handleTrackEvent(
        e,
        remoteVideos,
        setRemoteVideos,
        remoteVideoRef1,
        broadcaster
      );
    const answer = await peer[broadcaster].createAnswer();
    await peer[broadcaster].setLocalDescription(answer);
    const payload = {
      desc: peer[broadcaster].localDescription,
      offerId,
      answerId,
      event,
    };

    ws.emit("signalAnswer", payload);

    peer[broadcaster].addTransceiver("video", { direction: "recvonly" });
  });
}

async function sendOffer(peer, socket) {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
    desc: peer.localDescription,
    offerId: socket.id,
    answerId: undefined,
  };
//   console.log("送出sdp協議 => ", payload.desc.sdp);
  socket.emit("broadcast", payload);
  console.log("send offer to server => ", payload);
}

async function handleTrackEvent(
  e,
  remoteVideos,
  setRemoteVideos,
  remoteVideoRef1,
  broadcaster
) {
  console.log("偵測連線帶有track => 顯示stream於頁面上", e.streams[0]);

  //   setRemoteVideos((prev) => {
  //     return [{ broadcaster, stream: e.streams[0] }, ...prev];
  //   });

  setRemoteVideos(function (prev) {
    return [{stream:e.streams[0]}, ...prev];
  });


}

export { init };
