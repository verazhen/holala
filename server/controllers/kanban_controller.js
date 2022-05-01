const Kanban = require("../models/kanban_model");

const getTasks = async (req, res) => {
  const { id } = req.params;
  const data = await Kanban.getTasks(id);

  return res.json(data);
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

const delCard = async (req, res) => {
  const data = req.body;

  const { list, uniqueId } = req.query;

  if (!uniqueId) {
    return res.status(401).json({
      error: "please send the task id you want to delete",
    });
  }

  if (!list) {
    console.log("刪除整張list");
  }
  const response = await Kanban.delTask(data, uniqueId);
  if (!response) {
    return res.status(401).json({
      error: "wrong input",
    });
  }

  return res.json({
    data: { listId: list, response },
  });
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
  delCard,
  addComment,
  uploadImage,
  getTaskDetails,
};
