const router = require("express").Router();

const {
  getTasks,
  addCard,
  addTask,
  getChat,
  delCard,
  addComment
} = require("../controllers/kanban_controller");

const { wrapAsync,authentication } = require("../../util/util");

//get all task in all list
router.route("/task/:id").get(wrapAsync(getTasks));

//add new List or update order
router.route("/task/:id").post(wrapAsync(addCard));

//add new task/todos or update order
router.route("/kanban/:kanbanId/list/:listId").post(authentication(),wrapAsync(addTask));

//add comments
router.route("/kanban/:kanbanId/list/:listId/task/:taskId").post(authentication(),wrapAsync(addComment));

//delete card
router.route("/task").delete(wrapAsync(delCard));

//get history chat
router.route("/chat").get(wrapAsync(getChat));

module.exports = router;
