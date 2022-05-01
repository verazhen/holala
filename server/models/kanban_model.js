const { mongo } = require("./mongocon");
const { pool } = require("./mysqlcon");
const { generateUploadURL } = require("./s3");

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

      tasks[j].name = tasks[j].assignee ? users.name : null;
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

  let [tags] = await pool.query(
    "SELECT label FROM tags WHERE kanban_id = ?",
    [id]
  );


  return { data, user:members, tags };
};

const getTodos = async (taskId) => {
  const [tasks] = await pool.query(`SELECT * FROM tasks WHERE parent_id = ?`, [
    taskId,
  ]);
  return tasks;
};

const getImages = async (taskId) => {
  const [images] = await pool.query(`SELECT * FROM images WHERE task_id = ?`, [
    taskId,
  ]);
  return images;
};

const getComment = async (user, taskId) => {
  const [comments] = await pool.query(
    "SELECT * FROM comments WHERE task_id = ?",
    [taskId]
  );

  for (const i in comments) {
    const [[users]] = await pool.query("SELECT name FROM users WHERE id = ?", [
      comments[i].uid,
    ]);
    comments[i].name = users.name;
  }

  return comments;
};

const getTaskDetails = async (user, taskId) => {
  const [comments] = await pool.query(
    "SELECT * FROM comments WHERE task_id = ?",
    [taskId]
  );

  for (const i in comments) {
    const [[users]] = await pool.query("SELECT name FROM users WHERE id = ?", [
      comments[i].uid,
    ]);
    comments[i].name = users.name;
  }

  const [images] = await pool.query(`SELECT * FROM images WHERE task_id = ?`, [
    taskId,
  ]);

  const [todos] = await pool.query(`SELECT * FROM tasks WHERE parent_id = ?`, [
    taskId,
  ]);

  const [tags] = await pool.query(`SELECT * FROM task_tags WHERE task_id = ?`, [
    taskId,
  ]);
  for (const i in tags) {
    const [[tag]] = await pool.query("SELECT label FROM tags WHERE id = ?", [
      tags[i].tag_id,
    ]);
    tags[i].label = tag.label;
  }

  return { comments, images, todos, tags };
};

//TODO: Efficiency
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

const addComment = async (data, user, taskId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [res] = await pool.query(
      "INSERT INTO comments (task_id,uid,content) VALUES (?,?,?)",
      [taskId, user.id, data.content]
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

const uploadImage = async (taskId) => {
  const conn = await pool.getConnection();
  try {
    const url = await generateUploadURL();
    await conn.query("START TRANSACTION");
    const imageUrl = url.split("?")[0];

    const [res] = await pool.query(
      "INSERT INTO images (task_id,url) VALUES (?,?)",
      [taskId, imageUrl]
    );

    await conn.query("COMMIT");
    return url;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

module.exports = {
  getTasks,
  addTask,
  addList,
  getChat,
  updateChat,
  delTask,
  addComment,
  uploadImage,
  getTaskDetails,
};
