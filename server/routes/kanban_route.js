const router = require("express").Router();
const { Role } = require("../../util/enums");
const { wrapAsync, authentication } = require("../../util/util");

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

//get all task in all list
router
  .route("/kanban/:kanbanId/tasks")
  .get(authentication(Role.viewer), wrapAsync(getTasks));

//get kanban Detail
router
  .route("/kanban/:kanbanId")
  .get(authentication(Role.viewer), wrapAsync(getKanban));

//get task details
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId")
  .get(authentication(Role.viewer), wrapAsync(getTaskDetails));

//add new List or update order
router
  .route("/kanban/:kanbanId/tasks")
  .post(authentication(Role.editor), wrapAsync(addCard));

//add a new task/todo
router
  .route("/kanban/:kanbanId/list/:listId/addTest")
  .post(authentication(Role.editor), wrapAsync(addNewTask));

//update a task/todo
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId")
  .put(authentication(Role.editor), wrapAsync(updateTask));

//update a list
router
  .route("/kanban/:kanbanId/list/:listId/detail")
  .put(authentication(Role.editor), wrapAsync(updateListDetail));

//add new task/todos or update order
router
  .route("/kanban/:kanbanId/list/:listId")
  .put(authentication(Role.editor), wrapAsync(updateList));

//add comments
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/comment")
  .post(authentication(Role.editor), wrapAsync(addComment));

//upload image
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/imageUrl")
  .get(authentication(Role.viewer), wrapAsync(uploadImage));

//update tag
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/tag")
  .put(authentication(Role.editor), wrapAsync(updateTags));

//update todos
router
  .route("/kanban/:kanbanId/list/:listId/task/:taskId/todo")
  .put(authentication(Role.editor), wrapAsync(updateTodos));

//update members
router
  .route("/kanban/:kanbanId/members")
  .put(authentication(Role.editor), wrapAsync(updateMembers));

//get history chat
router
  .route("/chat/:kanbanId")
  .get(authentication(Role.viewer), wrapAsync(getChat));

module.exports = router;
