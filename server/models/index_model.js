const { pool } = require("./mysqlcon");
const { Role } = require("./components");

const getKanbans = async (uid) => {
  const [kanbans] = await pool.query(
    "SELECT kanban_id, role_id FROM kanban_permission WHERE uid = ?",
    [uid]
  );

  if (kanbans.length === 0) {
    return [];
  }
  const id = kanbans.reduce((accu, prev) => {
    accu.push(prev.kanban_id);
    return accu;
  }, []);
  const [res] = await pool.query("SELECT * FROM kanbans WHERE kanban_id IN ?", [
    [id],
  ]);

  return res;
};

const addKanban = async (id, data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const { title } = data;

    const [kanban] = await conn.query(
      "INSERT INTO kanbans (title,owner_id) VALUES (?,?)",
      [title, id]
    );
    console.log(kanban.insertId);

    const [res] = await conn.query(
      "INSERT INTO kanban_permission (uid,kanban_id,role_id) VALUES (?,?,?)",
      [id, kanban.insertId, 1]
    );

    await conn.query("COMMIT");
    return { kanban_id: kanban.insertId };
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

module.exports = {
  getKanbans,
  addKanban,
};
