const { pool } = require("./mysqlcon");

//get Meeting
const getTasks = async (id) => {
  const [lists] = await pool.query("SELECT * FROM lists WHERE kanban_id = ?", [
    id,
  ]);
  let data = [];
  for (let i = 0; i < lists.length; i++) {
    const { id, title, orders } = lists[i];
    const [tasks] = await pool.query(
      `SELECT * FROM tasks WHERE list_id = ${id}`
    );
    data.push({ id, title, orders, tasks });
  }

  return data;
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

module.exports = {
  getRoom,
};
