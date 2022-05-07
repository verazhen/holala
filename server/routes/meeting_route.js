const router = require("express").Router();

const { wrapAsync, authentication } = require("../../util/util");

const {
  getMeetings,
  getMeetingDetail,
  sendEmail,
  saveNote,
  createMeeting,
} = require("../controllers/meeting_controller");

router
  .route("/kanban/:kanbanId/meeting")
  .get(authentication(), wrapAsync(createMeeting));

router.route("/kanban/:kanbanId/meetings").get(authentication(),wrapAsync(getMeetings));

router.route("/kanban/:kanbanId/meeting/:meetingId").get(authentication(),wrapAsync(getMeetingDetail));

router.route("/kanban/:kanbanId/meeting/:meetingId/note").put(authentication(),wrapAsync(saveNote));

router
  .route("/kanban/:kanbanId/meeting/:noteId/email")
  .post(authentication(),wrapAsync(sendEmail));

module.exports = router;
