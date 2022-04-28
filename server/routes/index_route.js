const router = require("express").Router();

const {
  getKanbans,
  updateKanban,
  delKanban,
} = require("../controllers/index_controller");

const { wrapAsync, authentication } = require("../../util/util");

//get all kanbans
router.route("/kanbans").get(authentication(),wrapAsync(getKanbans));

//create or edit a kanban
router.route("/kanban").post(authentication(),wrapAsync(updateKanban));

//delete a kanban
router.route("/kanban").delete(authentication(),wrapAsync(delKanban));

module.exports = router;
