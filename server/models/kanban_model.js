const { mongo } = require("./mongocon");
const { pool } = require("./mysqlcon");

//TODO: Efficiency
const getTasks = async () => {
  const [lists] = await pool.query("SELECT * FROM lists WHERE kanban_id = 1");
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

const addList = async ({ data }) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [insert] = data.slice(-1);
    const { listName } = insert;
    const [res] = await pool.query(
      "INSERT INTO lists (kanbanId,listName) VALUES (1,?)",
      [listName]
    );

    await conn.query("COMMIT");
    return res;
  } catch (e) {
    await conn.query("ROLLBACK");
    return false;
  } finally {
    await conn.release();
  }
};

const addTask = async ({ listId, tasks }) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const values = tasks.map(({ taskName, taskOrder, uniqueId }) => {
      if (!taskOrder) {
        const dateTime = Date.now();
        const timestamp = Math.floor(dateTime / 1000);
        taskOrder = timestamp;
      }
      return [listId, taskName, taskOrder, uniqueId];
    });

    const [res] = await pool.query(
      "INSERT INTO tasks (listId,taskName,taskOrder,uniqueId) VALUES ? ON DUPLICATE KEY UPDATE taskOrder = VALUES(taskOrder)",
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
