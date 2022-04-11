const router = require("express").Router();

const { getTasks, addCard } = require("../controllers/kanban_controller");

const { wrapAsync } = require("../../util/util");




//add new task
router.route("/task").post(wrapAsync(addCard));

//get all task in all list
router.route("/task").get(wrapAsync(getTasks));

module.exports = router;
