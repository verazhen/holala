require("dotenv").config();
const User = require("../server/models/user_model");
const { TOKEN_SECRET } = process.env; // 30 days by seconds

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};


module.exports = {
  //   authentication,
  wrapAsync,
};
