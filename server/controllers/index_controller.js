const Kanban = require("../models/index_model");

const getKanbans = async (req, res) => {
  const uid = 1;
  const data = await Kanban.getKanbans(uid);

  return res.json({
    data,
  });
};

module.exports = {
  getKanbans,
};
