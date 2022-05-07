const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const {
  getMeetings,
  getTranscription,
  sendEmail,
  getNote,
  saveNote,
  createMeeting,
} = require("../controllers/meeting_controller");

router
  .route("/kanban/:kanbanId/meeting")
  .get(authentication(), wrapAsync(createMeeting));

router.route("/kanban/:kanbanId/meetings").get(wrapAsync(getMeetings));

router.route("/kanban/:kanbanId/meeting/:meetingId").get(wrapAsync(getTranscription));

router.route("/kanban/:kanbanId/meeting/:meetingId/note").get(wrapAsync(getNote));

router.route("/kanban/:kanbanId/meeting/:meetingId/note").put(wrapAsync(saveNote));

router
  .route("/kanban/:kanbanId/meeting/:noteId/email")
  .post(wrapAsync(sendEmail));

module.exports = router;
