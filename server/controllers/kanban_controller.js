const Kanban = require("../models/kanban_model");

const getTasks = async (req, res) => {
  const {id} = req.params;
  const data = await Kanban.getTasks(id);


  return res.json({
    data,
  });
};

const addCard = async (req, res) => {
  const data = req.body;

  const { list } = req.query;
  if (!list) {
    const response = await Kanban.addList(data);
    return res.json({
      data: { listId: response.insertId },
    });
  }
  const response = await Kanban.addTask(data);
  if (!response) {
    return res.status(401).json({
      error: "wrong input",
    });
  }

  return res.json({
    data: { listId: list, taskId: response.insertId },
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

module.exports = {
  getTasks,
  addCard,
  getChat,
  updateChat,
  delCard,
};
