require("dotenv").config();
const Report = require("../models/report_model");
const { wrapModel } = require("../../util/util");

const getTasksAmount = async (req, res) => {
  const { kanbanId, status } = req.params;
  let { range } = req.query;

  const response = await wrapModel(
    Report.getTasksAmount,
    kanbanId,
    status,
    range
  );

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const getMeetings = async (req, res) => {
  const { kanbanId } = req.params;
  let { range } = req.query;

  const response = await wrapModel(Report.getMeetings, kanbanId, range);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const getTasksChart = async (req, res) => {
  const { kanbanId } = req.params;
  let { range, interval } = req.query;

  const response = await wrapModel(
    Report.getTasksChart,
    kanbanId,
    range,
    interval
  );

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }
  return res.json({
    data: response,
  });
};

const getLoading = async (req, res) => {
  const { kanbanId } = req.params;
  let { range } = req.query;

  const response = await wrapModel(Report.getLoading, kanbanId, range);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }
  return res.json({ data: response });
};

module.exports = {
  getTasksAmount,
  getTasksChart,
  getMeetings,
  getLoading,
};
