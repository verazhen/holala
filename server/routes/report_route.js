const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { getTasksAmount,getTasksChart } = require("../controllers/report_controller");

router
  .route("/kanban/:kanbanId/report/taskAmount/:status")
  .get(authentication(), wrapAsync(getTasksAmount));

router
  .route("/kanban/:kanbanId/report/taskChart")
  .get(authentication(), wrapAsync(getTasksChart));

module.exports = router;
