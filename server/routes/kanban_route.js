const router = require("express").Router();

const { getTasks } = require("../controllers/kanban_controller");

const { wrapAsync } = require("../../util/util");

//add new list

//add new task

//get all task in all list
router.route("/task").get(wrapAsync(getTasks));

module.exports = router;
