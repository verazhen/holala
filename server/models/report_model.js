const { pool } = require("./mysqlcon");
const Util = require("../../util/report_util");

async function findListIds(kanbanId) {
  const [lists] = await pool.query(`SELECT id FROM lists WHERE kanban_id = ?`, [
    kanbanId,
  ]);
  return lists.map((list) => list.id);
}

const getTasksAmount = async (kanbanId, status, range) => {
  try {
    const listIds = await findListIds(kanbanId);
    if (listIds.length <= 0) {
      return { taskAmount: 0, taskAmountCompared: 0 };
    }

    const rangeStart = Util.findRangeStart(Date.now(), range);
    const rangeStartCompared = Util.findRangeStartCompared(Date.now(), range);

    const tasksSql = {
      all: `SELECT count(*) FROM tasks WHERE list_id in (?) AND delete_dt IS NULL`,
      finishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?) AND checked > ? AND delete_dt IS NULL`,
      unfinishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?) AND checked IS NULL AND delete_dt IS NULL`,
    };

    const tasksComparedSql = {
      all: `SELECT count(*) FROM tasks WHERE list_id in (?) AND create_dt <= ? AND delete_dt IS NULL`,
      finishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?)  AND checked <= ? AND checked > ? AND delete_dt IS NULL`,
      unfinishedByRange: `SELECT count(*) FROM tasks WHERE list_id in (?) AND (checked IS NULL OR checked >= ?) AND delete_dt IS NULL`,
    };

    const [[tasks]] = await pool.query(tasksSql[status], [listIds, rangeStart]);
    const [[tasksCompared]] = await pool.query(tasksComparedSql[status], [
      listIds,
      rangeStart,
      rangeStartCompared,
    ]);

    return {
      taskAmount: tasks["count(*)"],
      taskAmountCompared: tasksCompared["count(*)"],
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getMeetings = async (kanbanId, range) => {
  try {
    const timestamp = Date.now();
    const rangeStart = Util.findRangeStart(Date.now(), range);
    const rangeStartCompared = Util.findRangeStartCompared(Date.now(), range);

    const [[meetings]] = await pool.query(
      `SELECT count(*) FROM meetings WHERE kanban_id = ? AND end_dt > ? `,
      [kanbanId, rangeStart]
    );

    return { meetings: meetings["count(*)"] };
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getTasksChart = async (kanbanId, range, interval) => {
  try {
    const listIds = await findListIds(kanbanId);
    let intervalTags,
      finishedTaskSet,
      remainingTaskSet,
      idealTaskSet = [];

    const response = {
      intervalTags: [],
      finishedTaskSet: [],
      remainingTaskSet: [],
      idealTaskSet: [],
    };

    if (listIds.length <= 0) {
      //FE data format needed:
      return response;
    }

    const timestamp = Date.now();
    const rangeEnd = new Date(timestamp);
    const rangeStart = Util.findRangeStart(Date.now(), range);

    //sort by checked 雙指針 88 => function
    const [tasks] = await pool.query(
      `SELECT checked,create_dt FROM tasks WHERE list_id in (?) AND delete_dt IS NULL ORDER BY checked`,
      [listIds]
    );

    intervalTags = Util.getIntervalTags(rangeEnd, rangeStart, range, interval);
    finishedTaskSet = Util.getFinishedTaskSet(intervalTags, tasks);
    remainingTaskSet = intervalTags.map((interval, index, arr) => {
      const end = new Date(arr[index + 1]);
      const checkedInRange = tasks.filter(({ checked, create_dt }) => {
        return (checked >= end || !checked) && create_dt <= end;
      });
      return checkedInRange.length;
    });

    intervalTags.pop();
    finishedTaskSet.pop();
    remainingTaskSet.pop();

    const idealTaskSetInterval =
      (remainingTaskSet[0] - remainingTaskSet[remainingTaskSet.length - 1]) /
      (remainingTaskSet.length - 1);

    idealTaskSet = remainingTaskSet.map((remainingTaskSet, i, arr) => {
      return arr[0] - i * idealTaskSetInterval;
    });

    return {
      intervalTags,
      finishedTaskSet,
      remainingTaskSet,
      idealTaskSet,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getLoading = async (kanbanId, range) => {
  try {
    const timestamp = Date.now();
    const rangeEnd = new Date(timestamp);
    const rangeStart = Util.findRangeStart(Date.now(), range);
    const res = {};
    res.name = [];
    res.finished = [];
    res.unfinished = [];

    const [members] = await pool.query(
      `SELECT uid FROM kanban_permission WHERE kanban_id = ?`,
      [kanbanId]
    );

    const listIds = await findListIds(kanbanId);

    for (const i in members) {
      const [[users]] = await pool.query(
        "SELECT name FROM users WHERE id = ?",
        [members[i].uid]
      );
      res.name.push(users.name);

      if (listIds.length <= 0) {
        return res;
      }

      const [tasksFinished] = await pool.query(
        "SELECT id FROM tasks WHERE assignee = ? AND checked > ? AND list_id in (?) AND delete_dt IS NULL",
        [members[i].uid, rangeStart, listIds]
      );
      res.finished.push(tasksFinished.length);

      const [tasksUnfinished] = await pool.query(
        "SELECT id FROM tasks WHERE assignee = ? AND checked IS NULL AND list_id IN (?) AND delete_dt IS NULL",
        [members[i].uid, listIds]
      );
      res.unfinished.push(tasksUnfinished.length);
    }

    return res;
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = {
  getTasksAmount,
  getTasksChart,
  getMeetings,
  getLoading,
};
