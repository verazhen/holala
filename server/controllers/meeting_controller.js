require("dotenv").config();
const Meeting = require("../models/meeting_model");
const { wrapModel } = require("../../util/util");

const createMeeting = async (req, res) => {
  const { user } = req;
  const { kanbanId } = req.params;
  const response = await wrapModel(Meeting.createMeeting, {
    user: user.id,
    kanbanId,
  });

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
  const response = await wrapModel(Meeting.getMeetings, kanbanId);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }
  return res.json(response);
};

//TODOS:cache for transcript
const getMeetingDetail = async (req, res) => {
  const { kanbanId, meetingId } = req.params;
  const response = await wrapModel(
    Meeting.getMeetingDetail,
    kanbanId,
    meetingId
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

const saveNote = async (req, res) => {
  const { meetingId } = req.params;
  const { data } = req.body;
  const response = await wrapModel(Meeting.saveNote, meetingId, data);

  if (response.error) {
    return res
      .status(response.code)
      .send({ status_code: response.code, error: response.error });
  }

  return res.json({
    data: response,
  });
};

const sendEmail = async (req, res) => {
  try {
    const { kanbanId, noteId } = req.params;
    const user = req.user;
    const { data } = req.body;
    const response = await wrapModel(
      Meeting.sendEmail,
      kanbanId,
      noteId,
      data,
      user
    );

    if (response.error) {
      return res
        .status(response.code)
        .send({ status_code: response.code, error: response.error });
    }

    return res.json({
      status_code: 200,
    });
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getMeetings,
  getMeetingDetail,
  sendEmail,
  saveNote,
  createMeeting,
};
