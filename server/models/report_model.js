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
    const timestamp = Date.now();
    const rangeStart = new Date(timestamp - 1000 * 60 * 60 * 24 * (range - 1));
    const rangeStartCompared = new Date(
      timestamp - 1000 * 60 * 60 * 24 * (range * 2 - 1)
    );

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

const getMeetings = async (kanbanId, range) => {
  try {
    const timestamp = Date.now();
    const rangeStart = new Date(timestamp - 1000 * 60 * 60 * 24 * (range - 1));
    const rangeStartCompared = new Date(
      timestamp - 1000 * 60 * 60 * 24 * (range * 2 - 1)
    );

    const [[meetings]] = await pool.query(
      `SELECT count(*) FROM meetings WHERE kanban_id = ? AND end_dt > ? `,
      [kanbanId, rangeStart]
    );

    return meetings["count(*)"];
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getTasksChart = async (kanbanId, range, interval) => {
  try {
    const [lists] = await pool.query(
      `SELECT id FROM lists WHERE kanban_id = ?`,
      [kanbanId]
    );
    const listIds = lists.reduce((accu, curr) => {
      accu.push(curr.id);
      return accu;
    }, []);

    const timestamp = Date.now();
    const rangeEnd = new Date(timestamp);
    const rangeStart = new Date(timestamp - 1000 * 60 * 60 * 24 * (range - 1));

    const [tasks] = await pool.query(
      `SELECT checked,create_dt FROM tasks WHERE list_id in (?)`,
      [listIds]
    );

    const intervalTags = [];
    //     function getTags(currTime, end, interval) {
    //       if (currTime >= end) {
    //         const date = getFullDate(currTime);
    //         intervalTags.unshift(date);
    //         const yesterday = new Date();
    //         yesterday.setDate(currTime.getDate() - interval);
    //         getTags(yesterday, end, interval);
    //       }
    //       return;
    //     }

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
    const rangeStart = new Date(timestamp - 1000 * 60 * 60 * 24 * (range - 1));

    const [members] = await pool.query(
      `SELECT uid FROM kanban_permission WHERE kanban_id = ?`,
      [kanbanId]
    );
    const res = {};
    res.name = [];
    res.finished = [];
    res.unfinished = [];

    for (const i in members) {
      const [[users]] = await pool.query(
        "SELECT name FROM users WHERE id = ?",
        [members[i].uid]
      );
      res.name.push(users.name);

      const [tasks] = await pool.query(
        "SELECT id FROM tasks WHERE assignee = ? AND checked > ?",
        [members[i].uid, rangeStart]
      );
      res.finished.push(tasks.length);

      const [tasks2] = await pool.query(
        "SELECT id FROM tasks WHERE assignee = ? AND checked IS NULL",
        [members[i].uid, rangeStart]
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
