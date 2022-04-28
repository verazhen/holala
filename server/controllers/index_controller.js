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

module.exports = {
  getKanbans,
};
