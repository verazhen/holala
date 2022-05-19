const { pool } = require("./mysqlcon");

function getFullDate(targetDate) {
  var D, y, m, d;
  if (targetDate) {
    D = new Date(targetDate);
    y = D.getFullYear();
    m = D.getMonth() + 1;
    d = D.getDate();
  } else {
    y = fullYear;
    m = month;
    d = date;
  }
  m = m > 9 ? m : "0" + m;
  d = d > 9 ? d : "0" + d;

  return y + "-" + m + "-" + d;
}

async function findListIds(kanbanId) {
  const [lists] = await pool.query(`SELECT id FROM lists WHERE kanban_id = ?`, [
    kanbanId,
  ]);
  const listIds = lists.reduce((accu, curr) => {
    accu.push(curr.id);
    return accu;
  }, []);

  return listIds;
}

function findRangeStart(timestamp, range) {
  return new Date(timestamp - 1000 * 60 * 60 * 24 * (range - 1));
}

function findRangeStartCompared(timestamp, range) {
  return new Date(timestamp - 1000 * 60 * 60 * 24 * (range * 2 - 1));
}

const getTasksAmount = async (kanbanId, status, range) => {
  try {
    const listIds = await findListIds(kanbanId);
    if (listIds.length <= 0) {
      return { taskAmount: 0, taskAmountCompared: 0 };
    }

    const rangeStart = findRangeStart(Date.now(), range);
    const rangeStartCompared = findRangeStartCompared(Date.now(), range);

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
    const rangeStart = findRangeStart(Date.now(), range);
    const rangeStartCompared = findRangeStartCompared(Date.now(), range);

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

//FE data format example:
const getTasksChart = async (kanbanId, range, interval) => {
  try {
    const listIds = await findListIds(kanbanId);
    if (listIds.length <= 0) {
    //FE data format needed:
      return {
        intervalTags: [],
        finishedTaskSet: [],
        remainingTaskSet: [],
        idealTaskSet: [],
      };
    }

    const timestamp = Date.now();
    const rangeEnd = new Date(timestamp);
    const rangeStart = findRangeStart(Date.now(), range);

    const [tasks] = await pool.query(
      `SELECT checked,create_dt FROM tasks WHERE list_id in (?) AND delete_dt IS NULL`,
      [lists]
    );

    //TODOS:高耦合
    const intervalTags = [];
    function getTags(currTime, end, interval) {
      for (let i = 0; i < range / interval + 1; i++) {
        let date = new Date(
          timestamp - 1000 * 60 * 60 * 24 * (range - 1 - i * interval)
        );
        date = getFullDate(date);
        intervalTags.push(date);
      }
      return;
    }
    getTags(rangeEnd, rangeStart, interval);

    const finishedTaskSet = intervalTags.reduce((accu, curr, index, arr) => {
      const currTime = new Date(arr[index]);
      const after = new Date(arr[index + 1]);
      const checkedInRange = tasks.filter(({ checked }) => {
        return checked >= currTime && checked < after;
      });

      accu.push(checkedInRange.length);
      return accu;
    }, []);

    const remainingTaskSet = intervalTags.reduce((accu, curr, index, arr) => {
      const after = new Date(arr[index + 1]);
      const checkedInRange = tasks.filter(({ checked, create_dt }) => {
        return (checked >= after || !checked) && create_dt <= after;
      });
      accu.push(checkedInRange.length);
      return accu;
    }, []);

    intervalTags.pop();
    finishedTaskSet.pop();
    remainingTaskSet.pop();

    const idealTaskSetInterval =
      (remainingTaskSet[0] - remainingTaskSet[remainingTaskSet.length - 1]) /
      (remainingTaskSet.length - 1);

    const idealTaskSet = remainingTaskSet.map((remainingTaskSet, i, arr) => {
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
    const rangeStart = findRangeStart(Date.now(), range);
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

      const [tasks] = await pool.query(
        "SELECT id FROM tasks WHERE assignee = ? AND checked > ? AND list_id in (?) AND delete_dt IS NULL",
        [members[i].uid, rangeStart, listIds]
      );
      res.finished.push(tasks.length);

      const [tasks2] = await pool.query(
        "SELECT id FROM tasks WHERE assignee = ? AND checked IS NULL AND list_id IN (?) AND delete_dt IS NULL",
        [members[i].uid, rangeStart, listIds]
      );
      res.unfinished.push(tasks2.length);
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
