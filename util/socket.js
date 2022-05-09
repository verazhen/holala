const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Kanban = require("../server/models/kanban_model");
const Meeting = require("../server/models/meeting_model");

function findNowRoom(client) {
  return Object.keys(client.rooms).find((item) => {
    return item !== client.id;
  });
}

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
  //   io.listen(3400);

  io.on("connection", (socket) => {
    console.log(`user ${socket.id} is connected`);
    //---------------chatroom socket
    socket.on("kanban", async ({ kanbanId, uid }) => {
      console.log(`user ${socket.id} joins in kanban: ${kanbanId}`);
      socket.join(kanbanId);
      socket.on("getMessage", (message) => {
        console.log(message);
        io.to(kanbanId).emit("getMessage", message);
        Kanban.updateChat(message).then((res) => console.log(res));
      });
    });

    socket.on("get room", async ({ uid, kanbanId }) => {
      const { roomId, isNewRoom } = await Meeting.createMeeting({
        uid,
        kanbanId,
      });
      io.to(kanbanId).emit("get room", { roomId, isNewRoom });
    });

    socket.on("leave room", async ({ uid, kanbanId }) => {
      const result = await Meeting.leaveRoom({ uid, kanbanId });
      let message;

      if (result === null) {
        message = `${uid} has left the room`;
      } else if (!result) {
        message = `failed to leave room`;
      } else {
        message = `${uid} has ended the room`;
      }
      console.log(message, result);

      io.to(kanbanId).emit("leave room", { message, result });
    });

    socket.on("join room", (roomID) => {
      console.log("a user join in room-", roomID);
      if (users[roomID]) {
        const length = users[roomID].length;
        users[roomID].push(socket.id);
      } else {
        users[roomID] = [socket.id];
      }
      socketToRoom[socket.id] = roomID;
      const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
      console.log(usersInThisRoom);
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
      socket.broadcast.emit("user left", socket.id);
    });

    socket.on("leave meet", () => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }
      socket.broadcast.emit("user left", socket.id);
    });
  });
};
