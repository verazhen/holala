const Kanban = require("../models/kanban_model");
const { wrapModel } = require("../../util/util");

const getTasks = async (req, res) => {
  const { kanbanId } = req.params;
  const { user } = req;
  const response = await wrapModel(Kanban.getTasks, kanbanId, user);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json(response);
};

const getKanban = async (req, res) => {
  const { kanbanId } = req.params;
  const response = await wrapModel(Kanban.getKanban, kanbanId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({ data: response });
};

const addNewTask = async (req, res) => {
  const { data } = req.body;
  const { kanbanId, listId } = req.params;
  const response = await wrapModel(Kanban.addNewTask, data, listId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({ id: response });
};

const getTaskDetails = async (req, res) => {
  const { user } = req;
  const { kanbanId, listId, taskId } = req.params;
  const response = await wrapModel(Kanban.getTaskDetails, user, taskId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const addList = async (req, res) => {
  const { data } = req.body;
  const { kanbanId } = req.params;

  const response = await wrapModel(Kanban.addList, kanbanId, data);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }
  return res.json({
    data: { listId: response.insertId },
  });
};

const updateList = async (req, res) => {
  const { data } = req.body;
  const { listId } = req.params;
  const response = await wrapModel(Kanban.updateList, data);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: { listId, taskId: response.insertId },
  });
};

const updateTask = async (req, res) => {
  const { data } = req.body;
  const { taskId } = req.params;
  const response = await wrapModel(Kanban.updateTask, data, taskId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({ data: response });
};

const getChat = async (req, res) => {
  const { kanbanId } = req.params;
  const response = await wrapModel(Kanban.getChat, kanbanId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const updateChat = async (req, res) => {
  const { data } = req.body;
  const response = await wrapModel(Kanban.updateChat, data);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    response,
  });
};

const addComment = async (req, res) => {
  const { data } = req.body;
  const { user } = req;
  const { kanbanId, listId, taskId } = req.params;
  const response = await wrapModel(Kanban.addComment, data, user, taskId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    response,
  });
};

const updateTags = async (req, res) => {
  const { data } = req.body;
  const { taskId } = req.params;
  const response = await wrapModel(Kanban.updateTags, data, taskId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    response,
  });
};

const updateTodos = async (req, res) => {
  const { data } = req.body;
  const { taskId, listId } = req.params;
  const response = await wrapModel(Kanban.updateTodos, data, taskId, listId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    response,
  });
};

const uploadImage = async (req, res) => {
  const { data } = req.body;
  const { kanbanId, listId, taskId } = req.params;
  const response = await wrapModel(Kanban.uploadImage, kanbanId, taskId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const updateListDetail = async (req, res) => {
  const { data } = req.body;
  const { kanbanId, listId } = req.params;
  const response = await wrapModel(Kanban.updateListDetail, data, listId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const updateMembers = async (req, res) => {
  const { data } = req.body;
  const { kanbanId } = req.params;
  const response = await wrapModel(Kanban.updateMembers, data, kanbanId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

module.exports = {
  getTasks,
  addList,
  updateList,
  getChat,
  updateChat,
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
};
