require("dotenv").config();
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
const util = require("util");

jwt.asyncVerify = util.promisify(jwt.verify);
jwt.asyncSign = util.promisify(jwt.sign);
bcrypt.hashAsync = util.promisify(bcrypt.hash);
bcrypt.compareAsync = util.promisify(bcrypt.compare);

module.exports = {
  jwt,
  bcrypt,
};
