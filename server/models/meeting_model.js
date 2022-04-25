const { pool } = require("./mysqlcon");
const fs = require("fs/promises");
const aws = require("aws-sdk");
// const multerS3 = require('multer-s3');

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
    const [[res]] = await pool.query(
      `SELECT user_id,id FROM meetings WHERE kanban_id = ? AND end_dt IS NULL`,
      [kanbanId]
    );
    let response;

    if (res.user_id != uid) {
      response = 1;
    } else {
      const [result] = await pool.query(
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

module.exports = {
  getRoom,
  leaveRoom,
  getMeetings,
};
