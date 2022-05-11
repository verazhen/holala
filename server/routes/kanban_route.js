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
  updateListDetail,
  updateMembers,
  getKanban,
} = require("../controllers/kanban_controller");

const { wrapAsync, authentication } = require("../../util/util");

//get all task in all list
router
  .route("/kanban/:kanbanId/tasks")
  .get(authentication(2), wrapAsync(getTasks));

//get kanban Detail
router.route("/kanban/:kanbanId").get(authentication(2), wrapAsync(getKanban));

//get task details
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId")
  .get(authentication(2), wrapAsync(getTaskDetails));

//add new List or update order
router
  .route("/kanban/:kanbanId/tasks")
  .post(authentication(1), wrapAsync(addCard));

//add a new task/todo
router
  .route("/kanban/:kanbanId/list/:listId/addTest")
  .post(authentication(1), wrapAsync(addNewTask));

//update a task/todo
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId")
  .put(authentication(1), wrapAsync(updateTask));

//update a list
router
  .route("/kanban/:kanbanId/list/:listId/detail")
  .put(authentication(1), wrapAsync(updateListDetail));

//add new task/todos or update order
router
  .route("/kanban/:kanbanId/list/:listId")
  .put(authentication(1), wrapAsync(updateList));

//add comments
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/comment")
  .post(authentication(1), wrapAsync(addComment));

//upload image
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/imageUrl")
  .get(authentication(2), wrapAsync(uploadImage));

//update tag
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/tag")
  .put(authentication(1), wrapAsync(updateTags));

//update todos
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/todo")
  .put(authentication(1), wrapAsync(updateTodos));

//update members
router
  .route("/kanban/:kanbanId/members")
  .put(authentication(1), wrapAsync(updateMembers));

//get history chat
router.route("/chat/:kanbanId").get(authentication(2), wrapAsync(getChat));

module.exports = router;
