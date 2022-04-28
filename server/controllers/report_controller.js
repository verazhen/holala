require("dotenv").config();
const Report = require("../models/report_model");

const getTasksAmount = async (req, res) => {
  try {
    const { kanbanId, status } = req.params;
    let { range} = req.query;
    if (!range) range = 7;
    const response = await Report.getTasksAmount(kanbanId, status, range);
    return res.json({
      data: response,
    });
  } catch (error) {
    console.log(error);
    return { error };
  }
};

module.exports = {
  getTasksAmount,
};
