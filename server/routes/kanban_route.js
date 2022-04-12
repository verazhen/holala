const router = require("express").Router();

const {
  getTasks,
  addCard,
  getChat
} = require("../controllers/kanban_controller");

const { wrapAsync } = require("../../util/util");

//get all task in all list
router.route("/task").get(wrapAsync(getTasks));

//add new task
router.route("/task").post(wrapAsync(addCard));

//get history chat
router.route("/chat").get(wrapAsync(getChat));


module.exports = router;
