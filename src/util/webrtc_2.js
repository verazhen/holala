import Peer from "simple-peer";

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

}


export { init };
