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


function findRangeStart(timestamp, range) {
  return new Date(timestamp - 1000 * 60 * 60 * 24 * (range - 1));
}

function findRangeStartCompared(timestamp, range) {
  return new Date(timestamp - 1000 * 60 * 60 * 24 * (range * 2 - 1));
}

function getIntervalTags(currTime, end, range, interval) {
  const intervalTags = [];
  for (let i = 0; i < range / interval + 1; i++) {
    let date = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * (range - 1 - i * interval)
    );
    date = getFullDate(date);
    intervalTags.push(date);
  }
  return intervalTags;
}

function getFinishedTaskSet(intervalTags, tasks) {
  let taskPointer = 0;
  const finishedTaskSet = intervalTags.map((interval, index, arr) => {
    const begin = new Date(arr[index]);
    const end = new Date(arr[index + 1]);
    let finishedTask = 0;
    for (let i = taskPointer; i < tasks.length; i++) {
      const checked_dt = tasks[i].checked;
      console.log(checked_dt, tasks[i], i);
      if (checked_dt >= end) {
        break;
      } else if (checked_dt >= begin) {
        finishedTask++;
        taskPointer++;
      }
    }

    return finishedTask;
  });
  return finishedTaskSet;
}

module.exports = {
  getFullDate,
  findRangeStart,
  findRangeStartCompared,
  getIntervalTags,
  getFinishedTaskSet,
};
