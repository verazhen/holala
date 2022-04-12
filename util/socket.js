const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const Kanban = require("../server/models/kanban_model");

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
  io.listen(3100);

  io.on("connection", (socket) => {
    console.log(`user ${socket.id} is connected`);
    socket.on("disconnect", () => {
      console.log("user disconnected to index");
    });

    socket.on("kanban", (kanbanId) => {
      socket.join(kanbanId);
      console.log(`user ${socket.id} joins in kanban: ${kanbanId}`);
      socket.on("getMessage", (message) => {
        Kanban.updateChat(message).then((res) => console.log(res));
        io.to(kanbanId).emit("getMessage", message);
      });
    });
  });
};
