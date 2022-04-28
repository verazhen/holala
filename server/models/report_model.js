const { pool } = require("./mysqlcon");

const getTasksAmount = async (kanbanId, status, range) => {
  try {
    const [lists] = await pool.query(
      `SELECT id FROM lists WHERE kanban_id = ?`,
      [kanbanId]
    );
    const listIds = lists.reduce((accu, curr) => {
      accu.push(curr.id);
      return accu;
    }, []);

    let tasks;
    let tasksCompared;
    let rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - range);

    const tasksSql = {
      all: `SELECT count(*) FROM tasks WHERE list_id in (?) `,
      finishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?) AND checked > ?`,
      unfinishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?) AND checked IS NULL`,
    };

    const tasksComparedSql = {
      all: `SELECT count(*) FROM tasks WHERE list_id in (?) AND create_dt <= ?`,
      finishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?)  AND checked <= ? AND checked > ?`,
      unfinishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?) AND (checked IS NULL OR checked >= ?)`,
    };

    let rangeStartCompared = new Date();
    rangeStartCompared.setDate(rangeStartCompared.getDate() - range * 2);

    [[tasks]] = await pool.query(tasksSql[status], [listIds, rangeStart]);

    [[tasksCompared]] = await pool.query(tasksComparedSql[status], [
      listIds,
      rangeStart,
      rangeStartCompared,
    ]);

    const taskAmount = tasks["count(*)"];
    const taskAmountCompared = tasksCompared["count(*)"];
    return { taskAmount, taskAmountCompared };
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = {
  getTasksAmount,
};
