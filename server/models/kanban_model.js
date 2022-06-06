const { mongo } = require("./mongocon");
const { pool } = require("./mysqlcon");
const { generateUploadURL } = require("./s3");
const { Role } = require("../../util/enums");
const { getKeyByValue } = require("../../util/util");

const getTasks = async (id, user) => {
  const [lists] = await pool.query("SELECT * FROM lists WHERE kanban_id = ?", [
    id,
  ]);
  let data = [];
  for (let i = 0; i < lists.length; i++) {
    const { id, title, orders, delete_dt } = lists[i];
    const [tasks] = await pool.query(
      `SELECT * FROM tasks WHERE list_id = ${id} AND parent_id IS NULL`
    );

    for (let j = 0; j < tasks.length; j++) {
      if (tasks[j].assignee) {
        const [[user]] = await pool.query(
          "SELECT name FROM users WHERE id = ?",
          [tasks[j].assignee]
        );
        if (user) {
          tasks[j].name = user.name;
        }
      }
    }

    data.push({ id, title, orders, tasks, delete_dt });
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
    members[i].role_label = getKeyByValue(Role, members[i].role_id);
  }

  let [tags] = await pool.query("SELECT * FROM tags WHERE kanban_id = ?", [id]);

  return { account: user, data, user: members, tags };
};

const getTask = async (taskId) => {
  const [[task]] = await pool.query("SELECT * FROM tasks WHERE id = ?", [
    taskId,
  ]);

  return task;
};

const getTodos = async (taskId) => {
  const [tasks] = await pool.query(`SELECT * FROM tasks WHERE parent_id = ?`, [
    taskId,
  ]);
  return tasks;
};

const getKanban = async (kanbanId) => {
  const [[kanban]] = await pool.query(
    `SELECT * FROM kanbans WHERE kanban_id = ?`,
    [kanbanId]
  );
  return kanban;
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

const addNewTask = async (data, listId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const orders = Date.now() * 100;
    const [res] = await conn.query(
      "INSERT INTO tasks (list_id,title,orders,parent_id) VALUES (?,?,?,?)",
      [listId, data.title, orders, data.parent_id]
    );

    await conn.query("COMMIT");
    return res.insertId;
  } catch (e) {
    await conn.query("ROLLBACK");
    console.log(e);
    return false;
  } finally {
    await conn.release();
  }
};

const updateTask = async (data, taskId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const { delete_dt, title, assignee, description } = data;
    let { due_dt, checked } = data;

    if (due_dt) {
      due_dt = `${due_dt} 00:00:00`;
    }

    checked = checked ? new Date() : null;
    const [res] = await conn.query(
      `UPDATE tasks SET delete_dt = ?, title=?,assignee=?,due_dt=?,checked=?,description=? WHERE id=?`,
      [delete_dt, title, assignee, due_dt, checked, description, taskId]
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

const updateListDetail = async (data, listId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const { title } = data;
    let { delete_dt } = data;

    if (delete_dt === 1) {
      delete_dt = new Date();
    }

    const [res] = await conn.query(
      `UPDATE lists SET delete_dt = ?, title=? WHERE id=?`,
      [delete_dt, title, listId]
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

const updateList = async (tasks) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const values = tasks.map(({ id, list_id, title, orders }) => {
      console.log(id, list_id, title, orders);
      return [id, list_id, title, orders];
    });

    const [res] = await pool.query(
      `INSERT INTO tasks (id,list_id,title,orders) VALUES ? ON
      DUPLICATE KEY
       UPDATE orders =VALUES(orders),list_id =VALUES(list_id)`,
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

const updateMembers = async (data, kanbanId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const { members } = data;

    if (members.length === 0) {
      await conn.query("COMMIT");
      return { status: 403, code: 4032, error: "Operation Denied" };
    }

    const values = members.map(({ uid, role_id }) => {
      return [uid, kanbanId, role_id];
    });
    await conn.query(`DELETE FROM kanban_permission WHERE kanban_id=?`, [
      kanbanId,
    ]);

    const [res] = await conn.query(
      `INSERT INTO kanban_permission (uid, kanban_id, role_id) VALUES ? `,
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

const updateTags = async (data, taskId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const values = data.map(({ id }) => {
      return [taskId, id];
    });

    await conn.query(`DELETE FROM task_tags WHERE task_id=?`, [taskId]);

    let res = null;

    if (data.length > 0) {
      [res] = await conn.query(
        `INSERT INTO task_tags (task_id,tag_id) VALUES ? `,
        [values]
      );
    }

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

const updateTodos = async (data, taskId, listId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const values = data.map(({ title, checked }) => {
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime / 1000);
      if (checked) {
        checked = new Date();
      } else {
        checked = null;
      }

      return [title, checked, timestamp, taskId, listId];
    });

    await conn.query(`DELETE FROM tasks WHERE parent_id=?`, [taskId]);

    let res = null;

    if (data.length > 0) {
      [res] = await conn.query(
        `INSERT INTO tasks (title,checked,orders,parent_id,list_id) VALUES ? `,
        [values]
      );
    }

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

const getChat = async (kanbanId) => {
  const data = await mongo
    .collection("chat")
    .find({ kanbanId: `${kanbanId}` })
    .toArray();
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

const uploadImage = async (kanbanId, taskId) => {
  const conn = await pool.getConnection();
  try {
    const url = await generateUploadURL(kanbanId, "image", "jpg");
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
  updateList,
  addList,
  getChat,
  updateChat,
  addComment,
  uploadImage,
  getTaskDetails,
  addNewTask,
  updateTask,
  updateTags,
  updateTodos,
  updateListDetail,
  updateMembers,
  getKanban,
  getTask,
};
