const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Kanban = require("../server/models/kanban_model");
const Meeting = require("../server/models/meeting_model");
const Index = require("../server/models/index_model");
const users = {};
const socketToRoom = {};
const socketToUser = {};
const blockTasks = {};
const onlineUsers = {};

function findNowRoom(client) {
  return Object.keys(client.rooms).find((item) => {
    return item !== client.id;
  });
}

function blockNestToObj(nestedObj, socket) {
  const result = Object.values(nestedObj).reduce((accu, curr) => {
    const [listId] = Object.getOwnPropertyNames(curr);
    if (!accu[listId]) {
      accu[listId] = [];
    }
    accu[listId].push({ block: curr[listId], editor: socketToUser[socket.id] });
    return accu;
  }, {});
  return result;
}

module.exports = (server) => {
  let io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`user ${socket.id} is connected`);
    //---------------chatroom socket
    socket.on("kanban", async ({ kanbanId, uid }) => {
      socket.join(kanbanId);
      onlineUsers[socket.id] = kanbanId;
      const user = await Index.getUser(undefined, uid);
      socketToUser[socket.id] = user.name;
      console.log(onlineUsers);
      socket.on("getMessage", async (message) => {
        io.to(kanbanId).emit("getMessage", message);
        await Kanban.updateChat(message);
      });

      //init blocked tasks
      if (blockTasks[kanbanId]) {
        const blockTasksObj = blockNestToObj(blockTasks[kanbanId], socket);
        socket.emit("task block", blockTasksObj);
      }
    });

    socket.on("disconnect", () => {
      delete onlineUsers[socket.id];
      delete socketToUser[socket.id];
      const roomID = socketToRoom[socket.id];
      socket.emit("user left", { sender: socket.id });

      //delete the blocked list by socket.id
      if (blockTasks[onlineUsers[socket.id]]) {
        const kanbanId = onlineUsers[socket.id];
        delete blockTasks[kanbanId][socket.id];
        const blockTasksObj = blockNestToObj(blockTasks[kanbanId], socket);
        socket.to(kanbanId).emit("task block", blockTasksObj);
      }
    });

    //---------------kanban tasks socket
    socket.on("task update", ({ kanbanId, tasks }) => {
      console.log(onlineUsers);
      socket.to(kanbanId).emit("task update", tasks);
    });

    //---------------kanban race condition
    socket.on("task block", async ({ toBlock, taskId }) => {
      let blockTasksObj = {};
      const kanbanId = onlineUsers[socket.id];
      if (!toBlock) {
        //delete the taskId blocked
        delete blockTasks[kanbanId][socket.id];
        if (Object.values(blockTasks[kanbanId]).length > 0) {
          blockTasksObj = blockNestToObj(blockTasks[kanbanId], socket);
        }
      } else {
        blockTasks[kanbanId] = blockTasks[kanbanId] || {};
        blockTasks[kanbanId][socket.id] = blockTasks[kanbanId][socket.id] || {};

        const task = await Kanban.getTask(taskId);

        blockTasks[kanbanId][socket.id][task.list_id] = taskId;
        blockTasksObj = blockNestToObj(blockTasks[kanbanId], socket);
      }
      socket.to(kanbanId).emit("task block", blockTasksObj);
    });

    //rtc connection
    socket.on("get room", async ({ uid, kanbanId }) => {
      socket.join(`rtc-${kanbanId}`);
      const { roomId, isNewRoom } = await Meeting.createMeeting({
        uid,
        kanbanId,
      });
      socket.broadcast.to(`rtc-${kanbanId}`).emit("get room", { roomId });
      socket.emit("get room", { roomId, isNewRoom });
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

      io.to(`rtc-${kanbanId}`).emit("leave room", { status, message, result });
    });

    socket.on("subscribe", (data) => {
      //subscribe/join a room
      socket.join(`rtc-${data.room}`);
      socket.join(data.socketId);

      //Inform other members in the room of new user's arrival
      if (socket.adapter.rooms.has(`rtc-${data.room}`) === true) {
        socket
          .to(`rtc-${data.room}`)
          .emit("new user", { socketId: data.socketId });
      }
    });

    socket.on("newUserStart", (data) => {
      socket.to(data.to).emit("newUserStart", { sender: data.sender });
    });

    socket.on("user left", (data) => {
      socket.to(`rtc-${data.room}`).emit("user left", { sender: data.sender });
    });

    socket.on("sdp", (data) => {
      socket
        .to(data.to)
        .emit("sdp", { description: data.description, sender: data.sender });
    });

    socket.on("ice candidates", (data) => {
      socket.to(data.to).emit("ice candidates", {
        candidate: data.candidate,
        sender: data.sender,
      });
    });
  });
};
