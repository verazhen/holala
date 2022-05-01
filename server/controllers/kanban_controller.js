const Kanban = require("../models/kanban_model");

const getTasks = async (req, res) => {
  const { id } = req.params;
  const data = await Kanban.getTasks(id);

  return res.json(data);
};

const addNewTask = async (req, res) => {
  const { data } = req.body;
  const { kanbanId, listId } = req.params;
  const response = await Kanban.addNewTask(data, listId);

  return res.json(response);
};

const getTaskDetails = async (req, res) => {
  const { user } = req;
  const { kanbanId, listId, taskId } = req.params;
  const data = await Kanban.getTaskDetails(user, taskId);

  return res.json({
    data,
  });
};

const addCard = async (req, res) => {
  const { data } = req.body;
  const { id } = req.params;

  const response = await Kanban.addList(id, data);
  return res.json({
    data: { listId: response.insertId },
  });
};

const addTask = async (req, res) => {
  const { data } = req.body;
  const { listId } = req.params;
  const response = await Kanban.addTask(data);

  return res.json({
    data: { listId, taskId: response.insertId },
  });
};

const updateTask = async (req, res) => {
  const { data } = req.body;
  const { taskId } = req.params;
  const response = await Kanban.updateTask(data, taskId);

  return res.json({ data: response });
};

const getChat = async (req, res) => {
  const data = await Kanban.getChat();

  return res.json({
    data,
  });
};

const updateChat = async (req, res) => {
  const { data } = req.body;
  const response = await Kanban.updateChat(data);

  return res.json({
    response,
  });
};

const addComment = async (req, res) => {
  const { data } = req.body;
  const { user } = req;
  const { kanbanId, listId, taskId } = req.params;
  const response = await Kanban.addComment(data, user, taskId);

  return res.json({
    response,
  });
};

const uploadImage = async (req, res) => {
  const { data } = req.body;
  const { kanbanId, listId, taskId } = req.params;
  const response = await Kanban.uploadImage(taskId);

  return res.json({
    data: response,
  });
};

module.exports = {
  getTasks,
  addCard,
  addTask,
  getChat,
  updateChat,
  addComment,
  uploadImage,
  getTaskDetails,
  addNewTask,
  updateTask,
};
