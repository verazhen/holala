const router = require('express').Router();

const {
    wrapAsync,
    authentication
} = require('../../util/util');

const {
    getRoom,
} = require('../controllers/meeting_controller');

router.route("/kanban/:kanbanId/meeting").post(wrapAsync(getRoom));


module.exports = router;