const router = require("express").Router();

const {
  getKanbans,
  addKanban,
  updateKanban,
  getRoles,
  getUsers
} = require("../controllers/index_controller");

const { wrapAsync, authentication } = require("../../util/util");

//get all kanbans
router.route("/kanbans").get(authentication(), wrapAsync(getKanbans));

//create
router.route("/kanban").post(authentication(), wrapAsync(addKanban));

//edit or delete a kanban
router
  .route("/kanban/:kanbanId")
  .put(authentication(), wrapAsync(updateKanban));

//get roles
router.route("/roles").get(authentication(), wrapAsync(getRoles));

//get user
router.route("/users").get(authentication(), wrapAsync(getUsers));

module.exports = router;
