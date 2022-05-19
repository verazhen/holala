function json2Transcript(json) {
  let text = " ";
  let start_time;
  return json.reduce((accu, curr) => {
    if (curr.start_time) {
      start_time = start_time || curr.start_time;
      text = text.concat(curr.alternatives[0].content, " ");
    } else {
      const content = text.trim();
      const startTime = Math.floor(start_time);
      const hour =
        Math.floor(start_time / 60 / 60) > 10
          ? Math.floor(start_time / 60 / 60)
          : `0${Math.floor(start_time / 60 / 60)}`;
      const minute =
        Math.floor(start_time / 60) > 10
          ? Math.floor(start_time / 60)
          : `0${Math.floor(start_time / 60)}`;
      const second =
        startTime % 60 > 10 ? startTime % 60 : `0${startTime % 60}`;
      accu.push({
        start_time: `${hour}:${minute}:${second}`,
        timestamp: start_time,
        content: content.concat(curr.alternatives[0].content),
      });
      text = " ";
      start_time = undefined;
    }
    return accu;
  }, []);
}

module.exports = {
  json2Transcript,
};
