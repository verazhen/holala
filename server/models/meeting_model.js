const { pool } = require("./mysqlcon");
const fs = require("fs/promises");
const { generateUploadURL } = require("./s3");
const axios = require("axios").default;
const api_key = process.env.MAILGUN_KEY;
const domain = "verazon.online";
const mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });
const { Role } = require("./components");

const getMeetings = async (kanbanId) => {
  try {
    const [res] = await pool.query(
      `SELECT * FROM meetings WHERE kanban_id = ? AND end_dt IS NOT NULL`,
      [kanbanId]
    );
    console.log(res);
    let [members] = await pool.query(
      "SELECT uid,role_id FROM kanban_permission WHERE kanban_id = ?",
      [kanbanId]
    );
    console.log(members);
    for (const i in members) {
      const [[users]] = await pool.query(
        "SELECT name FROM users WHERE id = ?",
        [members[i].uid]
      );
      members[i].name = users.name;
      members[i].role_label = Role[members[i].role_id];
    }
    console.log(res, members);
    return { data: res, user: members };
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  }
};

const createMeeting = async ({ uid, kanbanId }) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    let roomId;
    let isNewRoom;
    //check if there's an ongoing meeting in this kanban
    const [[res]] = await pool.query(
      `SELECT id FROM meetings WHERE kanban_id = ? AND end_dt IS NULL`,
      [kanbanId]
    );

    if (!res) {
      //insert a new meeting
      const [result] = await pool.query(
        `INSERT INTO meetings (kanban_id,user_id) VALUES (?,?) `,
        [kanbanId, uid]
      );
      roomId = result.insertId;
      isNewRoom = true;
    } else {
      roomId = res.id;
      isNewRoom = false;
    }

    await conn.query("COMMIT");

    return { roomId, isNewRoom };
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const leaveRoom = async ({ uid, kanbanId }) => {
  const conn = await pool.getConnection();
  try {
    let recordUrl;
    await conn.query("START TRANSACTION");
    const [[res]] = await conn.query(
      `SELECT user_id,id FROM meetings WHERE kanban_id = ? AND end_dt IS NULL`,
      [kanbanId]
    );
    let response;

    if (res.user_id == uid) {
      //if the request user is the meeting owner
      //get s3 pre-signed url
      recordUrl = await generateUploadURL(kanbanId, `record/${res.id}`, "mp4");
      const url = recordUrl.split("?")[0];

      const [result] = await conn.query(
        `UPDATE meetings SET end_dt=?, record=? WHERE id=? `,
        [new Date(), url, res.id]
      );
      response = recordUrl;
    } else {
      //if the request user is not the meeting owner
      response = null;
    }

    await conn.query("COMMIT");

    return response;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

//TODO: CACHE
const getNote = async (kanbanId, noteId) => {
  try {
    const [[res]] = await pool.query(
      `SELECT transcript FROM meetings WHERE id = ?`,
      [noteId]
    );
    const url = res.transcript;
    const { data } = await axios.get(url);
    const { items } = data.results;
    let textArr = [];
    let text = " ";
    let start_time;
    console.log(items);
    items.map((item) => {
      if (item.start_time) {
        start_time = start_time || item.start_time;
        text = text.concat(item.alternatives[0].content, " ");
      } else {
        const content = text.trim();
        textArr.push({
          start_time,
          content: content.concat(item.alternatives[0].content),
        });
        text = " ";
        start_time = undefined;
      }
    });

    return textArr;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const sendEmail = async (kanbanId, noteId, data) => {
  try {
    //send Email
    const mail = {
      from: data.from,
      to: data.to,
      subject: data.subject,
      html: data.html,
    };

    mailgun.messages().send(mail, function (error, body) {
      console.log(body);
    });

    //TODO: email sending record

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const saveNote = async (meetingId, data) => {
  const conn = await pool.getConnection();
  try {
    const { notes, actions } = data;
    await conn.query("START TRANSACTION");

    const [result] = await conn.query(
      `UPDATE meetings SET notes=?, actions=? WHERE id=?`,
      [notes, actions, meetingId]
    );

    await conn.query("COMMIT");

    return result;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

module.exports = {
  createMeeting,
  leaveRoom,
  getMeetings,
  getNote,
  sendEmail,
  saveNote,
};
