const Index = require("../models/index_model");
const { wrapModel } = require("../../util/util");

const getKanbans = async (req, res) => {
  const { id } = req.user;
  const response = await wrapModel(Index.getKanbans, id);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  res.status(200).send({
    status_code: 200,
    user: req.user,
    data: response,
  });
};

const getRoles = async (req, res) => {
  const response = await wrapModel(Index.getRoles);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  res.status(200).send({
    status_code: 200,
    data: response,
  });
};

const getUsers = async (req, res) => {
  const response = await wrapModel(Index.getUsers);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }
  return res.status(200).send({
    status_code: 200,
    data: response,
  });
};

const getUser = async (req, res) => {
const { email } = req.query;
  const response = await wrapModel(Index.getUser,email);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }
  return res.status(200).send({
    status_code: 200,
    data: response,
  });
};

const addKanban = async (req, res) => {
  try {
    const { id } = req.user;
    const { data } = req.body;
    const response = await wrapModel(Index.addKanban, id, data);

    if (response.error) {
      return res
        .status(response.code)
        .send({ status_code: response.code, error: response.error });
    }

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
    const response = await wrapModel(Index.updateKanban, data, kanbanId);

    if (response.error) {
      return res
        .status(response.code)
        .send({ status_code: response.code, error: response.error });
    }

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
  getUser
};
