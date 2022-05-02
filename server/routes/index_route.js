const router = require("express").Router();

const {
  getKanbans,
  addKanban,
  updateKanban,
} = require("../controllers/index_controller");

const { wrapAsync, authentication } = require("../../util/util");

//get all kanbans
router.route("/kanbans").get(authentication(),wrapAsync(getKanbans));

//create
router.route("/kanban").post(authentication(),wrapAsync(addKanban));

//edit or delete a kanban
router.route("/kanban/:kanbanId").put(authentication(),wrapAsync(updateKanban));

module.exports = router;
