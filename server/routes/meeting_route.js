const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { getMeetings,getNote } = require("../controllers/meeting_controller");

router.route("/kanban/:kanbanId/meeting").get(wrapAsync(getMeetings));

router.route("/kanban/:kanbanId/meeting/:noteId").get(wrapAsync(getNote));

module.exports = router;
