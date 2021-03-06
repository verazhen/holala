const { pool } = require("./mysqlcon");
const { Role } = require("../../util/enums");

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

const updateKanban = async (data, kanbanId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const { title } = data;
    let { delete_dt } = data;

    if (delete_dt === 1) {
      delete_dt = new Date();
    }

    const [kanban] = await conn.query(
      `UPDATE kanbans SET delete_dt = ?, title=? WHERE kanban_id=?`,
      [delete_dt, title, kanbanId]
    );

    await conn.query("COMMIT");
    return kanban;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const getRoles = async () => {
  try {
    const roles = Object.keys(Role);
    for (let i = 0; i < roles.length; i++) {
      const roleObj = {
        id: Role[roles[i]],
        label: roles[i],
      };
      roles[i] = roleObj;
    }

    return roles;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getUsers = async () => {
  try {
    let [users] = await pool.query("SELECT * FROM users ");
    users = users.map((user) => {
      delete user.password;
      return user;
    });

    return users;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getUser = async (email, uid) => {
  try {
    let user;
    if (email) {
      [[user]] = await pool.query("SELECT * FROM users WHERE email = ?", email);
    } else if (uid) {
      [[user]] = await pool.query("SELECT * FROM users WHERE id = ?", uid);
    }

    if (!user) {
      return { code: 404, error: "user not found" };
    }

    console.log(user);
    return user;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = {
  getKanbans,
  addKanban,
  updateKanban,
  getRoles,
  getUsers,
  getUser,
};
