const Index = require("../models/index_model");

const getKanbans = async (req, res) => {
  try {
    const { id } = req.user;
    const data = await Index.getKanbans(id);

    res.status(200).send({
      status_code: 200,
      user: req.user,
      data,
    });
  } catch (error) {
    return { error };
  }
};

const getRoles = async (req, res) => {
  try {
    const data = await Index.getRoles();

    res.status(200).send({
      status_code: 200,
      data,
    });
  } catch (error) {
    return { error };
  }
};

const getUsers = async (req, res) => {
  try {
    const response = await Index.getUsers();

    return res.status(200).send({
      status_code: 200,
      data: response,
    });
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const addKanban = async (req, res) => {
  try {
    const { id } = req.user;
    const { data } = req.body;
    const response = await Index.addKanban(id, data);

    res.status(200).send({
      status_code: 200,
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

const updateKanban = async (req, res) => {
  try {
    const { data } = req.body;
    const { kanbanId } = req.params;
    const response = await Index.updateKanban(data, kanbanId);

    res.status(200).send({
      status_code: 200,
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getKanbans,
  addKanban,
  updateKanban,
  getRoles,
  getUsers,
};
