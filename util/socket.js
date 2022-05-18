const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Kanban = require("../server/models/kanban_model");
const Meeting = require("../server/models/meeting_model");

function findNowRoom(client) {
  return Object.keys(client.rooms).find((item) => {
    return item !== client.id;
  });
}

function blockNestToObj(nestedObj) {
  const result = Object.values(nestedObj).reduce((accu, curr) => {
    const [listId] = Object.getOwnPropertyNames(curr);
    if (!accu[listId]) {
      accu[listId] = [];
    }
    accu[listId].push(curr[listId]);
    return accu;
  }, {});
  return result;
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

  io.on("connection", (socket) => {
    console.log(`user ${socket.id} is connected`);
    //---------------chatroom socket
    socket.on("kanban", ({ kanbanId, uid }) => {
      socket.join(kanbanId);
      onlineUsers[socket.id] = kanbanId;
      socket.on("getMessage", async (message) => {
        io.to(kanbanId).emit("getMessage", message);
        await Kanban.updateChat(message);
      });

      //init blocked tasks
      if (blockTasks[kanbanId]) {
        const blockTasksObj = blockNestToObj(blockTasks[kanbanId]);
        console.log("connection");
        console.log(blockTasksObj);
        socket.emit("task block", blockTasksObj);
      }
    });

    socket.on("disconnect", () => {
      delete onlineUsers[socket.id];
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }

      //delete the blocked list by socket.id
      if (blockTasks[onlineUsers[socket.id]]) {
        const kanbanId = onlineUsers[socket.id];
        delete blockTasks[kanbanId][socket.id];
        const blockTasksObj = blockNestToObj(blockTasks[kanbanId]);
        socket.to(kanbanId).emit("task block", blockTasksObj);
      }
    });

    //---------------kanban tasks socket
    socket.on("task update", ({ kanbanId, tasks }) => {
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
          blockTasksObj = blockNestToObj(blockTasks[kanbanId]);
        }
      } else {
        blockTasks[kanbanId] = blockTasks[kanbanId] || {};
        blockTasks[kanbanId][socket.id] = blockTasks[kanbanId][socket.id] || {};

        const task = await Kanban.getTask(taskId);

        blockTasks[kanbanId][socket.id][task.list_id] = taskId;
        blockTasksObj = blockNestToObj(blockTasks[kanbanId]);
      }
      console.log("task unblock");
      console.log(blockTasksObj);
      socket.to(kanbanId).emit("task block", blockTasksObj);
    });

    //rtc connection
    socket.on("get room", async ({ uid, kanbanId }) => {
      socket.join(`rtc-${kanbanId}`);
      const { roomId, isNewRoom } = await Meeting.createMeeting({
        uid,
        kanbanId,
      });
      socket.broadcast.to(kanbanId).emit("get room", { roomId });
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

    socket.on("join room", (roomID) => {
      console.log("a user join in room- ", roomID);
      if (users[roomID]) {
        users[roomID].push(socket.id);
      } else {
        users[roomID] = [socket.id];
      }
      socketToRoom[socket.id] = roomID;
      const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);
      console.log(users[roomID]);

      //for new added user to sync online users
      io.to(socket.id).emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", (payload) => {
      console.log(
        `sending signal from ${socket.id} to ${payload.userToSignal}`
      );
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    });

    socket.on("returning signal", (payload) => {
      console.log(`returning signal from ${socket.id} to ${payload.callerID}`);
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("leave meet", (kanbanId) => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
      }
      console.log("user left ", roomID);
      console.log(users[roomID]);
      io.to(`rtc-${kanbanId}`).emit("user left", socket.id);
    });
  });
};
