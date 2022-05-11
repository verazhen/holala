require("dotenv").config();
const User = require("../server/models/user_model");
const { jwt, bcrypt } = require("./authTool");
const { TOKEN_SECRET } = process.env;

const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

const authentication = (roleId) => {
  return async function (req, res, next) {
    let accessToken = req.get("Authorization");
    const { kanbanId } = req.params;
    if (!accessToken) {
      res.status(401).send({ status_code: 401, error: "Unauthenticated" });
      return;
    }

    accessToken = accessToken.replace("Bearer ", "");
    if (accessToken == "null") {
      res.status(401).send({ status_code: 401, error: "Unauthenticated" });
      return;
    }

    try {
      const user = await jwt.asyncVerify(accessToken, TOKEN_SECRET);
      req.user = user;
      let userDetail;
      if (roleId == null || kanbanId == null) {
        userDetail = await User.getUserDetail(user.id);
        req.user.email = userDetail.email;
        next();
        if (!userDetail) {
          res.status(403).send({ status_code: 4030, error: "Forbidden" });
        }
      } else {
        if (roleId == 1 || roleId == 2) {
          userDetail = await User.getUserDetail(user.id, kanbanId, roleId);
        } else {
          next();
        }
        if (!userDetail) {
          //cannot view
          res.status(403).send({ status_code: 4031, error: "View Forbidden" });
        } else if (userDetail.error) {
          if (userDetail.error == 2) {
            //cannot edit
            res.status(403).send({ status_code: 4032, error: "Edit Forbidden" });
          }
          next();
        } else {
          req.user.email = userDetail.email;
          req.user.role_id = userDetail.role_id;
          req.user.role_label = userDetail.role_label;
          next();
        }
      }

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
