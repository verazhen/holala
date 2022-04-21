const { mongo } = require("./mongocon");
const { pool } = require("./mysqlcon");

//TODO: Efficiency
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

const addList = async (id, data) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [insert] = data.slice(-1);
    const { title } = insert;
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);
    const orders = timestamp;
    const [res] = await pool.query(
      "INSERT INTO lists (kanban_id,title,orders) VALUES (?,?,?)",
      [id, title, orders]
    );

    await conn.query("COMMIT");
    return res;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const addTask = async (listId, tasks) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    console.log(tasks);
    const values = tasks.map(
      ({ title, orders, assignee, due_dt, checked, delete_dt }) => {
        if (!orders) {
          const dateTime = Date.now();
          const timestamp = Math.floor(dateTime / 1000);
          orders = timestamp;
        }
        if (!checked) {
          checked = 0;
        }
        return [listId, title, orders, assignee, due_dt, checked, delete_dt];
      }
    );

    const [res] = await pool.query(
      "INSERT INTO tasks (list_id,title,orders,assignee,due_dt,checked,delete_dt) VALUES ? ON DUPLICATE KEY UPDATE orders =VALUES(orders)",
      [values]
    );

    await conn.query("COMMIT");
    return res;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const delTask = async ({ listId, tasks }, delUniqueId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [res] = await pool.query("DELETE FROM tasks WHERE uniqueId=?;", [
      delUniqueId,
    ]);

    await conn.query("COMMIT");
    return res;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const getChat = async () => {
  const data = await mongo.collection("chat").find({}).toArray();
  return data;
};

const updateChat = async (message) => {
  const data = await mongo.collection("chat").insertOne(message);
  return data;
};

module.exports = {
  getTasks,
  addTask,
  addList,
  getChat,
  updateChat,
  delTask,
};
