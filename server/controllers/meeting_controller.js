require("dotenv").config();
const Meeting = require("../models/meeting_model");

const getMeetings = async (req, res) => {
  try {
    const { kanbanId } = req.params;
    const response = await Meeting.getMeetings(kanbanId);
    return res.json({
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

const getNote = async (req, res) => {
  try {
    const { kanbanId, noteId } = req.params;
    const response = await Meeting.getNote(kanbanId, noteId);
    return res.json({
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

const saveNote = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { data } = req.body;
    const response = await Meeting.saveNote(meetingId, data);
    return res.json({
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

const sendEmail = async (req, res) => {
  try {
    const { kanbanId, noteId } = req.params;
    const { data } = req.body;
    const response = await Meeting.sendEmail(kanbanId, noteId, data);
    return res.json({
      data: response,
    });
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getMeetings,
  getNote,
  sendEmail,
  saveNote,
};
