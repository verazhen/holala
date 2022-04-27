const { pool } = require("./mysqlcon");
const fs = require("fs/promises");
const aws = require("aws-sdk");
const axios = require("axios").default;
const api_key = process.env.MAILGUN_KEY;
const domain = "verazon.online";
const mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

const s3 = new aws.S3({
  secretAccessKey: process.env.S3_SECRET,
  accessKeyId: process.env.S3_KEY,
  region: process.env.S3_REGION,
  params: {
    Bucket: "verazon.online",
  },
});

const getMeetings = async (kanbanId) => {
  const [res] = await pool.query(
    `SELECT * FROM meetings WHERE kanban_id = ? AND end_dt IS NOT NULL`,
    [kanbanId]
  );
  return res;
};

const getRoom = async ({ uid, kanbanId }) => {
  let roomId;
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    //check if there's an ongoing kanban
    const [[res]] = await pool.query(
      `SELECT id FROM meetings WHERE kanban_id = ? AND end_dt IS NULL`,
      [kanbanId]
    );

    if (!res) {
      const [result] = await pool.query(
        `INSERT INTO meetings (kanban_id,user_id) VALUES (?,?) `,
        [kanbanId, uid]
      );

      roomId = result.insertId;
    } else {
      roomId = res.id;
    }

    await conn.query("COMMIT");

    return roomId;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const leaveRoom = async ({ uid, kanbanId, url }) => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const s3Path = `holala/${timestamp}.mp4`;
  const res = await s3
    .putObject({
      Key: s3Path,
      Body: url,
      ContentType: "video/mp4",
      ACL: "public-read",
    })
    .promise();

  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [[res]] = await conn.query(
      `SELECT user_id,id FROM meetings WHERE kanban_id = ? AND end_dt IS NULL`,
      [kanbanId]
    );
    let response;

    if (res.user_id != uid) {
      response = 1;
    } else {
      const [result] = await conn.query(
        `UPDATE meetings SET end_dt=?, record=? WHERE id=? `,
        [1, s3Path, res.id]
      );
      response = result;
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
    const url = `https://s3.ap-southeast-1.amazonaws.com/verazon.online/${noteId}.json`;
    console.log(url);
    const { data } = await axios.get(url);
    const { items } = data.results;
    let textArr = [];
    let text = " ";
    let start_time;
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

const saveNote = async (noteId, data) => {
  const conn = await pool.getConnection();
  try {
    const { notes } = data;
    await conn.query("START TRANSACTION");

    const [result] = await conn.query(
      `UPDATE notes SET notes=? WHERE id=?`,
      [notes, noteId]
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
  getRoom,
  leaveRoom,
  getMeetings,
  getNote,
  sendEmail,
  saveNote,
};
