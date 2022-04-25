require("dotenv").config();
const Meeting = require("../models/meeting_model");

const getMeetings = async (req, res) => {
  try {
    const {kanbanId} = req.params;
    const response = await Meeting.getMeetings(kanbanId);
    return res.json({
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getMeetings,
};
