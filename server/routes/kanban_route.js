const router = require("express").Router();

const {
  getTasks,
  addCard,
  addTask,
  getChat,
  delCard,
  addComment,
  getComment,
  uploadImage,
  getTodos,
  getImages
} = require("../controllers/kanban_controller");

const { wrapAsync,authentication } = require("../../util/util");

//get all task in all list
router.route("/task/:id").get(wrapAsync(getTasks));

//get all todos in the task
router.route("/kanban/:kanbanId/list/:listId/task/:taskId/todos").get(wrapAsync(getTodos));

//get all images in the task
router.route("/kanban/:kanbanId/list/:listId/task/:taskId/images").get(wrapAsync(getImages));

//add new List or update order
router.route("/task/:id").post(wrapAsync(addCard));

//add new task/todos or update order
router.route("/kanban/:kanbanId/list/:listId").post(authentication(),wrapAsync(addTask));

//add comments
router.route("/kanban/:kanbanId/list/:listId/task/:taskId").post(authentication(),wrapAsync(addComment));

//upload image
router.route("/kanban/:kanbanId/list/:listId/task/:taskId/imageUrl").get(authentication(),wrapAsync(uploadImage));

//get comments
router.route("/kanban/:kanbanId/list/:listId/task/:taskId/comments").get(authentication(),wrapAsync(getComment));

//delete card
router.route("/task").delete(wrapAsync(delCard));

//get history chat
router.route("/chat").get(wrapAsync(getChat));

module.exports = router;
