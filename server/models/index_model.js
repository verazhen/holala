const { pool } = require("./mysqlcon");
const { Role } = require("./components");

const getKanbans = async (uid) => {
  const [kanbans] = await pool.query(
    "SELECT kanban_id, role_id FROM kanban_permission WHERE uid = ?",
    [uid]
  );

  const id = kanbans.reduce((accu, prev) => {
    accu.push(prev.kanban_id);
    return accu;
  }, []);
console.log(id)
  const test = [[1, 2]];
  const [res] = await pool.query("SELECT * FROM kanbans WHERE kanban_id IN ?", [
    [id]
  ]);

  return res;
};

module.exports = {
  getKanbans,
};
