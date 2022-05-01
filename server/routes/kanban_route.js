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
  updateTask
} = require("../controllers/kanban_controller");

const { wrapAsync, authentication } = require("../../util/util");

//get all task in all list
router.route("/task/:id").get(wrapAsync(getTasks));

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


//get history chat
router.route("/chat").get(wrapAsync(getChat));

module.exports = router;
