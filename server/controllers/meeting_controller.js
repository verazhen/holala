require("dotenv").config();
const Meeting = require("../models/meeting_model");

const getRoom = async (req, res) => {
  const { data } = req.body;

  try {
    const response = await Meeting.createRoom(data);
    return res.json({
      room: response,
    });
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getRoom,
};
