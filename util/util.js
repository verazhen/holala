require("dotenv").config();
const User = require("../server/models/user_model");
const { jwt, bcrypt } = require("./authTool");
const { TOKEN_SECRET } = process.env;
const { Role } = require("./enums");

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

async function wrapModel(fn, ...args) {
  let response;
  let counter = 0;

  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      if (!args[i]) {
        response = {
          code: 400,
          error: "Request Error: Missing parameters",
        };
        break;
      } else {
        counter++;
      }
    }
  }

  if (counter === args.length) {
    response = await fn(...args);
  }

  if (!response) {
    response = {
      code: 500,
      error: "Database Error",
    };
  }
  return response;
}

const authentication = (roleId) => {
  return async function (req, res, next) {
    try {
      let userDetail;
      let accessToken = req.get("Authorization");
      accessToken = accessToken.split(" ");
      if (accessToken[0] !== "Bearer" || !accessToken[1]) {
        res.status(401).send({ status_code: 401, error: "Unauthenticated" });
        return;
      }

      const user = await jwt.asyncVerify(accessToken[1], TOKEN_SECRET);
      req.user = user;

      const needRoleChecked =
        roleId && Object.values(Role).some((id) => id === roleId);

      //getUserDetail depends on whether needs execute role check
      if (!needRoleChecked) {
        userDetail = await User.getUserDetail(user.id);
        req.user.email = userDetail.email;
        next();
      } else {
        const { kanbanId } = req.params;
        userDetail = await User.getUserDetail(user.id, kanbanId, roleId);
        req.user.email = userDetail.email;
        req.user.role_id = userDetail.role_id;
        req.user.role_label = userDetail.role_label;
        next();
      }

      if (userDetail.error) {
        return res.status(403).send({
          status_code: userDetail.status,
          error: userDetail.error,
        });
      }

      return;
    } catch (err) {
      console.log(err);
      res.status(403).send({ status_code: 4030, error: "Forbidden" });
      return;
    }
  };
};

module.exports = {
  authentication,
  wrapAsync,
  wrapModel,
  getKeyByValue
};
