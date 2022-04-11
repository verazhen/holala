const { mongo } = require("./mongocon");
const { pool } = require("./mysqlcon");

const getTasks = async () => {
  //   const data = await mongo.collection("lists").find({}).toArray();
  const [lists] = await pool.query("SELECT * FROM lists WHERE kanbanId = 1");
  let data = [];
  for (let i = 0; i < lists.length; i++) {
    const { listId, listName } = lists[i];
    const [tasks] = await pool.query(
      `SELECT taskName FROM tasks WHERE listId = ${listId}`
    );
    data.push({ listId, listName, tasks });
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
  //   const res = await mongo.collection("lists").insertOne(data[]);

  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [insert] = tasks.slice(-1);
    const { taskName } = insert;
    const [res] = await pool.query(
      "INSERT INTO tasks (listId,taskName) VALUES (?,?)",
      [listId, taskName]
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

module.exports = {
  getTasks,
  addTask,
  addList,
};
