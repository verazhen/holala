const router = require("express").Router();

const {
  getTasks,
  addCard,
  updateList,
  getChat,
  addComment,
  uploadImage,
  getTaskDetails,
  addNewTask,
  updateTask,
  updateTags,
  updateTodos,
  updateListDetail
} = require("../controllers/kanban_controller");

const { wrapAsync, authentication } = require("../../util/util");

//get all task in all list
router.route("/task/:id").get(authentication(), wrapAsync(getTasks));

//get task details
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId")
  .get(authentication(), wrapAsync(getTaskDetails));

//add new List or update order
router.route("/task/:id").post(wrapAsync(addCard));

//add a new task/todo
router
  .route("/kanban/:kanbanId/list/:listId/addTest")
  .post(authentication(), wrapAsync(addNewTask));

//update a task/todo
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId")
  .put(authentication(), wrapAsync(updateTask));

//update a list
router
  .route("/kanban/:kanbanId/list/:listId/detail")
  .put(authentication(), wrapAsync(updateListDetail));

//add new task/todos or update order
router
  .route("/kanban/:kanbanId/list/:listId")
  .put(authentication(), wrapAsync(updateList));

//add comments
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/comment")
  .post(authentication(), wrapAsync(addComment));

//upload image
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/imageUrl")
  .get(authentication(), wrapAsync(uploadImage));

//update tag
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/tag")
  .put(authentication(), wrapAsync(updateTags));

//update todos
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/todo")
  .put(authentication(), wrapAsync(updateTodos));

//get history chat
router.route("/chat").get(wrapAsync(getChat));

module.exports = router;
