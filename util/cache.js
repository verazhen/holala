require("dotenv").config();
const redis = require("redis");

const { CACHE_URL } = process.env;
const redisClient = redis.createClient({
  url: CACHE_URL,
  socket: {
    keepAlive: false,
  },
});

redisClient.ready = false;

redisClient.on("ready", () => {
  redisClient.ready = true;
  console.log("【ENV Notification】 Redis is ready");
});

redisClient.on("error", () => {
  redisClient.ready = false;
  if (process.env.NODE_ENV == "production") {
    console.log("【ENV Notification】 Error in Redis");
  }
});

redisClient.on("end", () => {
  redisClient.ready = false;
  console.log("【ENV Notification】 Redis is disconnected");
});

module.exports = redisClient;
