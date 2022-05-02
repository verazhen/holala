require("dotenv").config();
const User = require("../server/models/user_model");
const { jwt, bcrypt } = require("./authTool");
const { TOKEN_SECRET } = process.env; // 30 days by seconds

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

const authentication = () => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    if (!accessToken) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken == "null") {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const user = await jwt.asyncVerify(accessToken, TOKEN_SECRET);
      req.user = user;
      let userDetail;
      userDetail = await User.getUserDetail(user.id);
      user.email = userDetail.email;
      user.picture = userDetail.picture;

      next();
      return;
    } catch (err) {
      console.log(err);
      res.status(403).send({ status_code: 403, error: "Forbidden" });
      return;
    }
  };
};

module.exports = {
  authentication,
  wrapAsync,
};
