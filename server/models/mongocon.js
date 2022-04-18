require("dotenv").config();

const { MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE } =
  process.env;
const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_DATABASE}?retryWrites=true&w=majority`;

const { MongoClient } = require("mongodb");

// Initialize connection once
const client = new MongoClient(uri);
const dbName = MONGO_DATABASE;
client.connect(async function (err) {
  if (err) throw err;
  console.log("mongodb is connected");
});
mongo = client.db(dbName);

module.exports = {
  mongo,
};
