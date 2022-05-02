const Kanban = require("../models/index_model");

const getKanbans = async (req, res) => {
  try {
    const { id } = req.user;
    const data = await Kanban.getKanbans(id);

    res.status(200).send({
      status_code: 200,
      user: req.user,
      data,
    });
  } catch (error) {
    return { error };
  }
};

const addKanban = async (req, res) => {
  try {
    const { id } = req.user;
    const { data } = req.body;
    const response = await Kanban.addKanban(id,data);

    res.status(200).send({
      status_code: 200,
      data:response,
    });
  } catch (error) {
    return { error };
  }
};

const updateKanban = async (req, res) => {
  try {
    const { data } = req.body;
    const { kanbanId } = req.params;
    const response = await Kanban.updateKanban(data,kanbanId);

    res.status(200).send({
      status_code: 200,
      data:response,
    });
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getKanbans,
  addKanban,
  updateKanban,
};
