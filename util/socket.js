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
const blockTasks = {};
const onlineUsers = {};

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
      onlineUsers[socket.id] = kanbanId;
      socket.on("getMessage", (message) => {
        console.log(message);
        io.to(kanbanId).emit("getMessage", message);
        Kanban.updateChat(message).then((res) => console.log(res));
      });

      //init blocked tasks
      if (blockTasks[kanbanId]) {
        const blockTasksObj = Object.values(blockTasks[kanbanId]).reduce(
          (accu, curr) => {
            const [listId] = Object.getOwnPropertyNames(curr);
            if (!accu[listId]) {
              accu[listId] = [];
            }
            accu[listId].push(curr[listId]);
            return accu;
          },
          {}
        );
      }
    });

    //---------------videoroom socket

    socket.on("get room", async ({ uid, kanbanId }) => {
      const { roomId, isNewRoom } = await Meeting.createMeeting({
        uid,
        kanbanId,
      });
      io.to(kanbanId).emit("get room", { roomId, isNewRoom });
    });

    socket.on("leave room", async ({ uid, kanbanId }) => {
      const result = await Meeting.leaveRoom({ uid, kanbanId });
      let status;
      let message;

      if (result === null) {
        status = 1;
        message = `${uid} has left the room`;
      } else if (!result) {
        status = 2;
        message = `failed to leave room`;
      } else {
        status = 3;
        message = `${uid} has ended the room`;
      }
      console.log(message, result);

      io.to(kanbanId).emit("leave room", { status, message, result });
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
      const str = socket.id + Math.floor(Math.random() * 100);
      //       socket.receiverId = socket.receiverId
      //         ? socket.receiverId
      //         : socket.id + Math.floor(Math.random() * 100);
      console.log("*************returning signal", str);
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: str,
      });
    });

    socket.on("disconnect", () => {
      delete onlineUsers[socket.id];
      console.log(onlineUsers);
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }
      socket.broadcast.emit("user left", socket.id);

      if (blockTasks[onlineUsers[socket.id]]) {
        const kanbanId = onlineUsers[socket.id];
        //delete the taskId blocked
        delete blockTasks[kanbanId][socket.id];
        const blockTasksObj = Object.values(blockTasks[kanbanId]).reduce(
          (accu, curr) => {
            const [listId] = Object.getOwnPropertyNames(curr);
            if (!accu[listId]) {
              accu[listId] = [];
            }
            accu[listId].push(curr[listId]);
            return accu;
          },
          {}
        );
        console.log(blockTasksObj);
        socket.broadcast.to(kanbanId).emit("task block", blockTasksObj);
      }
    });

    socket.on("leave meet", () => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }
      //       socket.broadcast.emit("user left", socket.id);
      socket.broadcast.emit("leave meet", socket.id);
    });

    //---------------kanban tasks socket
    socket.on("task update", ({ kanbanId, tasks }) => {
      console.log(tasks);
      socket.broadcast.to(kanbanId).emit("task update", tasks);
    });

    //---------------kanban race condition
    socket.on("task block", async (taskId) => {
      const kanbanId = onlineUsers[socket.id];
      if (!blockTasks[kanbanId]) {
        blockTasks[kanbanId] = {};
      }

      if (!blockTasks[kanbanId][socket.id]) {
        blockTasks[kanbanId][socket.id] = {};
      }

      const task = await Kanban.getTask(taskId);

      blockTasks[kanbanId][socket.id][task.list_id] = taskId;
      const blockTasksObj = Object.values(blockTasks[kanbanId]).reduce(
        (accu, curr) => {
          const [listId] = Object.getOwnPropertyNames(curr);
          if (!accu[listId]) {
            accu[listId] = [];
          }
          accu[listId].push(curr[listId]);
          return accu;
        },
        {}
      );
      console.log(blockTasksObj);
      socket.broadcast.to(kanbanId).emit("task block", blockTasksObj);
    });

    socket.on("task unblock", (taskId) => {
      const kanbanId = onlineUsers[socket.id];
      //delete the taskId blocked
      delete blockTasks[kanbanId][socket.id];
      const blockTasksObj = Object.values(blockTasks[kanbanId]).reduce(
        (accu, curr) => {
          const [listId] = Object.getOwnPropertyNames(curr);
          if (!accu[listId]) {
            accu[listId] = [];
          }
          accu[listId].push(curr[listId]);
          return accu;
        },
        {}
      );
      console.log(blockTasksObj);
      socket.broadcast.to(kanbanId).emit("task block", blockTasksObj);
    });
  });
};
