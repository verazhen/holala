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
      `SELECT * FROM tasks WHERE list_id = ${id} AND parent_id IS NULL`
    );
    for (let j = 0; j < tasks.length; j++) {
      const [[users]] = await pool.query(
        "SELECT name FROM users WHERE id = ?",
        [tasks[j].assignee]
      );

      tasks[j].assignee = tasks[j].assignee ? users.name : null;
    }

    data.push({ id, title, orders, tasks });
  }

  let [members] = await pool.query(
    "SELECT uid,role_id FROM kanban_permission WHERE kanban_id = ?",
    [id]
  );

  for (const i in members) {
    const [[users]] = await pool.query("SELECT name FROM users WHERE id = ?", [
      members[i].uid,
    ]);
    members[i].name = users.name;
  }

  return { data, members };
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

const addTask = async (tasks) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const values = tasks.map(
      ({
        list_id,
        title,
        orders,
        assignee,
        due_dt,
        checked,
        delete_dt,
        unique_id,
        description,
        parent_id,
      }) => {
        if (!orders) {
          const dateTime = Date.now();
          const timestamp = Math.floor(dateTime / 1000);
          orders = timestamp;
        }
        if (!checked) {
          checked = 0;
        }

        return [
          list_id,
          title,
          orders,
          assignee,
          due_dt,
          checked,
          delete_dt,
          unique_id,
          description,
          parent_id,
        ];
      }
    );

    const [res] = await pool.query(
      `INSERT INTO tasks (list_id,title,orders,assignee,due_dt,checked,delete_dt,unique_id,description,parent_id) VALUES ? ON
      DUPLICATE KEY
       UPDATE orders =VALUES(orders),list_id =VALUES(list_id),title =VALUES(title),delete_dt =VALUES(delete_dt),assignee =VALUES(assignee),due_dt =VALUES(due_dt),checkedt =VALUES(checked),description =VALUES(description),parent_id =VALUES(parent_id)`,
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
