require("dotenv").config();
const Report = require("../models/report_model");

const getTasksAmount = async (req, res) => {
  try {
    const { kanbanId, status } = req.params;
    let { range } = req.query;
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

const getTasksChart = async (req, res) => {
  try {
    const { kanbanId } = req.params;
    let { range, interval } = req.query;
    if (!range) range = 7;
    if (!interval) interval = 1;
    const response = await Report.getTasksChart(kanbanId, range, interval);
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
  getTasksChart,
};