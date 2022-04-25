const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { getMeetings } = require("../controllers/meeting_controller");

router.route("/kanban/:kanbanId/meeting").get(wrapAsync(getMeetings));

module.exports = router;
