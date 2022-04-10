const getTasks = async (req, res) => {
  return res.json({
    data: [
      {
        listName: "List1",
        tasks: [{ taskName: "task1" }],
      },
      {
        listName: "List",
        tasks: [{ taskName: "task1" },{ taskName: "task2" }],
      },
    ],
  });
};

module.exports = {
  getTasks,
};
