require("dotenv").config();
const morganBody = require("morgan-body");
const { PORT_TEST, PORT, NODE_ENV, API_VERSION } = process.env;
const port = NODE_ENV == "test" ? PORT_TEST : PORT;
const Cache = require("./util/cache");
// Express Initialization
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
require("./util/socket")(server);

app.set("trust proxy", true);
app.set("trust proxy", "loopback");
app.set("json spaces", 2);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

morganBody(app);

// CORS allow all
app.use(cors());

// API routes
app.use("/api/" + API_VERSION, [
  require("./server/routes/kanban_route"),
  require("./server/routes/index_route"),
  require("./server/routes/meeting_route"),
  require("./server/routes/user_route"),
  require("./server/routes/report_route"),
]);

app.use(function (req, res, next) {
  res.status(404).send({
    status_code: 404,
    error: "Route not found.",
  });
});

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send({
    status_code: 500,
    error: "Internal Server Error",
  });
});

server.listen(port, async () => {
  if (NODE_ENV != "test") {
    Cache.connect().catch(() => {
      console.log("【ENV Notification】 redis connect fail");
    });
  }
  console.log(`【ENV Notification】 Server listening on port: ${port}`);
});
