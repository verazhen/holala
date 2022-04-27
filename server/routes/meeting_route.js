const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const { getMeetings,getNote,sendEmail,saveNote } = require("../controllers/meeting_controller");

router.route("/kanban/:kanbanId/meeting").get(wrapAsync(getMeetings));

router.route("/kanban/:kanbanId/meeting/:noteId").get(wrapAsync(getNote));

router.route("/kanban/:kanbanId/meeting/:meetingId").put(wrapAsync(saveNote));

router.route("/kanban/:kanbanId/meeting/:noteId/email").post(wrapAsync(sendEmail));

module.exports = router;
