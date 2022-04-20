const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Kanban = require("../server/models/kanban_model");
const webrtc = require("wrtc");

function findNowRoom(client) {
  return Object.keys(client.rooms).find((item) => {
    return item !== client.id;
  });
}

// const config = {
//   iceServers: [
//     {
//       urls: "stun:stun.stunprotocol.org",
//     },
//   ],
// };
// const room = "room1";
// let viewers = {};
// let users = {};
// let senderStream = {};
//
// let peer = {};
// let sendCounter = 0;
// let viewCounter;
// let counter;
const users = {};
const socketToRoom = {};

module.exports = (server) => {
  let io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // const subClient = Cache.duplicate();
  //
  // io.adapter(createAdapter(Cache, subClient));
  io.listen(3400);

  io.on("connection", (socket) => {
    //---------------chatroom socket
    socket.on("kanban", ({ kanbanId, uid }) => {
      socket.join(kanbanId);
      console.log(`user ${socket.id} joins in kanban: ${kanbanId}`);
      users[socket.id] = uid;
      console.log("socket user list updated=> ", users);
      socket.on("getMessage", (message) => {
        Kanban.updateChat(message).then((res) => console.log(res));
        io.to(kanbanId).emit("getMessage", message);
      });
    });

    socket.on("join room", (roomID) => {
      if (users[roomID]) {
        const length = users[roomID].length;
        if (length === 4) {
          socket.emit("room full");
          return;
        }
        users[roomID].push(socket.id);
      } else {
        users[roomID] = [socket.id];
      }
      socketToRoom[socket.id] = roomID;
      const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

      socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", (payload) => {
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    });

    socket.on("returning signal", (payload) => {
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("disconnect", () => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }
    });
  });

  //   io.on("connection", (socket) => {
  //     console.log(`user ${socket.id} is connected`);
  //     socket.on("disconnect", () => {
  //       console.log(`user ${socket.id} is disconnected`);
  //       delete users[socket.id];
  //       delete viewers[socket.id];
  //       delete senderStream[socket.id];
  //       console.log("socket user list updated=> ", users);
  //     });
  //
  //     //---------------chatroom socket
  //     socket.on("kanban", ({ kanbanId, uid }) => {
  //       socket.join(kanbanId);
  //       console.log(`user ${socket.id} joins in kanban: ${kanbanId}`);
  //       users[socket.id] = uid;
  //       console.log("socket user list updated=> ", users);
  //       socket.on("getMessage", (message) => {
  //         Kanban.updateChat(message).then((res) => console.log(res));
  //         io.to(kanbanId).emit("getMessage", message);
  //       });
  //     });
  //
  //     //---------------video call socket (1 on 1)
  //     //         socket.on("joinRoom", (room) => {
  //     //           const nowRoom = findNowRoom(socket);
  //     //           if (nowRoom) {
  //     //             socket.leave(nowRoom);
  //     //           }
  //     //           socket.join(room);
  //     //           console.log(`join room: ${room}`);
  //     //           io.to(room).emit("roomBroadcast", "已有新人加入聊天室！");
  //     //         });
  //     //
  //     //         socket.on("peerconnectSignaling", (message) => {
  //     //           console.log("接收資料：", message);
  //     //
  //     //           //       const nowRoom = findNowRoom(socket);
  //     //           //       console.log('nowRoom: ',nowRoom)
  //     //           const nowRoom = "secret room";
  //     //           socket.to(nowRoom).emit("peerconnectSignaling", message);
  //     //         });
  //     //
  //     //         socket.on("disconnect", (socket) => {
  //     //           console.log(`socket 用戶離開 ${socket.id}`);
  //     //         });
  //
  //     //---------------video call socket (1 on 1 in simple peer)
  //     //     if (!users[socket.id]) {
  //     //       users[socket.id] = socket.id;
  //     //     }
  //     //     socket.emit("yourID", socket.id);
  //     //     io.sockets.emit("allUsers", users);
  //     //     socket.on("disconnect", () => {
  //     //       delete users[socket.id];
  //     //     });
  //     //
  //     //     socket.on("callUser", (data) => {
  //     //       io.to(data.userToCall).emit("hey", {
  //     //         signal: data.signalData,
  //     //         from: data.from,
  //     //       });
  //     //     });
  //     //
  //     //     socket.on("acceptCall", (data) => {
  //     //       io.to(data.to).emit("callAccepted", data.signal);
  //     //     });
  //
  //     //---------------video call socket (svc)
  //     socket.on("broadcast", async ({ desc, offerId, answerId }) => {
  //       console.log("get the offer from broadcaster");
  //       const broadcastPeer = new webrtc.RTCPeerConnection(config);
  //       broadcastPeer.ontrack = (e) => handleTrackEvent(e, socket); //有新的stream流入
  //       const broadcastDesc = new webrtc.RTCSessionDescription(desc);
  //       await broadcastPeer.setRemoteDescription(broadcastDesc);
  //       const broadcastAnswer = await broadcastPeer.createAnswer();
  //       await broadcastPeer.setLocalDescription(broadcastAnswer);
  //       const broadcastPayload = {
  //         desc: broadcastPeer.localDescription,
  //         offerId,
  //         answerId,
  //       };
  //       io.to(offerId).emit("getBroadcast", broadcastPayload);
  //       console.log("send the answer to broadcaster");
  //
  //       //ㄏ
  //
  //       //       for (let i = 0; i < Object.keys(viewers).length; i++) {
  //       //             const offerId = socket.id; //新用戶
  //       //             const answerId = Object.keys(viewers)[i]; //舊用戶
  //       //             const remoteStream = senderStream[socket.id];
  //       //             if (offerId === answerId) {
  //       //               console.log("略過自己的stream");
  //       //               return;
  //       //             }
  //       //             console.log(`建立新用戶${offerId} 與舊用戶${answerId} 的stream`,remoteStream);
  //       //             peer[offerId][answerId] = new webrtc.RTCPeerConnection(config);
  //       //             remoteStream
  //       //               .getTracks()
  //       //               .forEach((track) =>
  //       //                 peer[offerId][answerId].addTrack(track, remoteStream)
  //       //               );
  //       //             const offer = await peer[offerId][answerId].createOffer();
  //       //             await peer[offerId][answerId].setLocalDescription(offer);
  //       //             const payload = {
  //       //               desc: peer[offerId][answerId].localDescription,
  //       //               offerId,
  //       //               answerId,
  //       //             };
  //       //             io.to(answerId).emit("newUser", payload);
  //       //
  //       //           }
  //     });
  //
  //     socket.on("signalAnswer", async ({ desc, offerId, answerId, event }) => {
  //       const remoteDesc = new webrtc.RTCSessionDescription(desc);
  //       if (event === "newUser") {
  //         peer[offerId][answerId]
  //           .setRemoteDescription(remoteDesc)
  //           .catch((e) => console.log("signalAnswer Error=> ", e));
  //       } else if (event === "oldStream") {
  //         peer[answerId][offerId]
  //           .setRemoteDescription(remoteDesc)
  //           .catch((e) => console.log("signalAnswer Error=> ", e));
  //       }
  //     });
  //     //當viewer連線時
  //     //     socket.on("answer", ({ desc, receiver, sender }) => {
  //     //       const remoteDesc = new webrtc.RTCSessionDescription(desc);
  //     //       console.log(
  //     //         `收到Viewer Answer => 設定第${sendCounter}個sender(${sender})與第${
  //     //           receiver + 1
  //     //         }個viewer的下行連線 Description`
  //     //       );
  //     //       peer[receiver][sender]
  //     //         .setRemoteDescription(remoteDesc)
  //     //         .catch((e) => console.log(e));
  //     //     });
  //
  //     //上行連線
  //     //     socket.on("consumer", async ({ desc }) => {
  //     //       console.log(
  //     //         `-----------設定第${viewCounter + 1}個viewer的首次上行連線: ${
  //     //           socket.id
  //     //         }`
  //     //       );
  //     //
  //     //       peer[viewCounter] = {};
  //     //       peer[viewCounter][socket.id] = new webrtc.RTCPeerConnection(config);
  //     //       const receiverDesc = new webrtc.RTCSessionDescription(desc);
  //     //       await peer[viewCounter][socket.id].setRemoteDescription(receiverDesc);
  //     //       //             senderStream.getTracks().forEach(track => peer[viewCounter].addTrack(track, senderStream ));
  //     //       const answer = await peer[viewCounter][socket.id].createAnswer();
  //     //       await peer[viewCounter][socket.id].setLocalDescription(answer);
  //     //       const payload = {
  //     //         desc: peer[viewCounter][socket.id].localDescription,
  //     //         viewerId: socket.id,
  //     //       };
  //     //       io.to(socket.id).emit("getConsumer", payload);
  //     //       console.log(`send the answer to viewer: ${socket.id}`);
  //     //       //         }
  //     //     });
  //   });
  //   async function handleTrackEvent(e, socket) {
  //     console.log("socket.id => ", socket.id);
  //     viewers[socket.id] = users[socket.id];
  //     senderStream[socket.id] = e.streams[0];
  //     console.log(`目前有${Object.keys(viewers).length}個人在會議中=> `, viewers);
  //
  //     peer[socket.id] = {}; //peer[broadcaster][receiver]
  //
  //     for (let i = 0; i < Object.keys(viewers).length; i++) {
  //       const offerId = socket.id; //新用戶
  //       const answerId = Object.keys(viewers)[i]; //舊用戶
  //       const myStream = senderStream[offerId]; //新用戶
  //       const remoteStream = senderStream[answerId]; //舊用戶
  //       if (offerId === answerId) {
  //         console.log("略過自己的stream");
  //         return;
  //       }
  //
  //       //有新的stream流入，新用戶建立與線上所有用戶的pc，並提供stream（自己除外）
  //       console.log(`新用戶${offerId} 提供stream給舊用戶${answerId}`, myStream);
  //       peer[offerId][answerId] = new webrtc.RTCPeerConnection(config);
  //       myStream
  //         .getTracks()
  //         .forEach((track) => peer[offerId][answerId].addTrack(track, myStream));
  //       const offerSendVideo = await peer[offerId][answerId].createOffer();
  //       await peer[offerId][answerId].setLocalDescription(offerSendVideo);
  //       const myPayload = {
  //         desc: peer[offerId][answerId].localDescription,
  //         offerId,
  //         answerId,
  //         event: "newUser",
  //       };
  //       io.to(answerId).emit("signal", myPayload);
  //
  //       //有新的stream流入，新用戶建立與線上所有用戶的pc，並獲取stream（自己除外）
  //       console.log(
  //         `新用戶${offerId} 獲取舊用戶${answerId} 的stream`,
  //         remoteStream
  //       );
  //       peer[answerId][offerId] = new webrtc.RTCPeerConnection(config);
  //       remoteStream
  //         .getTracks()
  //         .forEach((track) =>
  //           peer[answerId][offerId].addTrack(track, remoteStream)
  //         );
  //       const offerGetVideo = await peer[answerId][offerId].createOffer();
  //       await peer[answerId][offerId].setLocalDescription(offerGetVideo);
  //       const remotePayload = {
  //         desc: peer[answerId][offerId].localDescription,
  //         offerId,
  //         answerId,
  //         event: "oldStream",
  //       };
  //       io.to(offerId).emit("signal", remotePayload);
  //     }
  //   }
};
