const Kanban = require("../models/kanban_model");

const getTasks = async (req, res) => {
  const data = await Kanban.getTasks();

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
  return res.json({
    data: { listId: list, taskId: response.insertId },
  });
};

module.exports = {
  getTasks,
  addCard,
};
