require("dotenv").config();
const Report = require("../models/report_model");

const getTasksAmount = async (req, res) => {
  const { kanbanId, status } = req.params;
  let { range } = req.query;
  if (!kanbanId || !status || !range) {
    return res.status(400).send({
      status_code: 400,
      error: "Request Error: range and kanbanId and status are required.",
    });
  }

  const response = await Report.getTasksAmount(kanbanId, status, range);
  if (!response) {
    return res.status(500).send({ status_code: 500, error: "Database Error" });
  }

  return res.json({
    data: response,
  });
};

const getMeetings = async (req, res) => {
  const { kanbanId } = req.params;
  let { range } = req.query;

  if (!kanbanId || !range) {
    return res.status(400).send({
      status_code: 400,
      error: "Request Error: range and kanbanId are required.",
    });
  }

  const response = await Report.getMeetings(kanbanId, range);
  return res.json({
    data: response,
  });
};

const getTasksChart = async (req, res) => {
  const { kanbanId } = req.params;
  let { range, interval } = req.query;

  if (!kanbanId || !range || !interval) {
    return res.status(400).send({
      status_code: 400,
      error:
        "Request Error: range and kanbanId and status and interval are required.",
    });
  }

  const response = await Report.getTasksChart(kanbanId, range, interval);
  return res.json({
    data: response,
  });
};

const getLoading = async (req, res) => {
  const { kanbanId } = req.params;
  let { range } = req.query;

  if (!kanbanId || !range) {
    return res.status(400).send({
      status_code: 400,
      error: "Request Error: range and kanbanId and status are required.",
    });
  }

  const response = await Report.getLoading(kanbanId, range);
  return res.json({ data: response });
};

module.exports = {
  getTasksAmount,
  getTasksChart,
  getMeetings,
  getLoading,
};
