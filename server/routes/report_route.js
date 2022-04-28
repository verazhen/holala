const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { getTasksAmount } = require("../controllers/report_controller");

router
  .route("/kanban/:kanbanId/report/taskAmount/:status")
  .get(authentication(), wrapAsync(getTasksAmount));

module.exports = router;
