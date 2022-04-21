const router = require("express").Router();

const {
  getKanbans,
  updateKanban,
  delKanban,
} = require("../controllers/index_controller");

const { wrapAsync } = require("../../util/util");

//get all kanbans
router.route("/kanbans").get(wrapAsync(getKanbans));

//create or edit a kanban
router.route("/kanban").post(wrapAsync(updateKanban));

//delete a kanban
router.route("/kanban").delete(wrapAsync(delKanban));




module.exports = router;
