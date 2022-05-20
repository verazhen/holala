require("dotenv").config();
const { NODE_ENV } = process.env;
const { bcrypt } = require("../util/authTool");
const {
  users,
  roles,
  products,
  product_images,
  colors,
  variants,
  hots,
  hot_products,
  campaigns,
} = require("./fake_data");
const { pool } = require("../server/models/mysqlcon");
const salt = parseInt(process.env.BCRYPT_SALT);

async function _createFakeUser(conn) {
  const encryped_users = users.map((user) => {
    const encryped_user = {
      email: user.email,
      password: user.password ? bcrypt.hashSync(user.password, salt) : null,
      name: user.name,
      login_dt: new Date(),
    };
    return encryped_user;
  });

  return await conn.query(
    "INSERT INTO users (email, password, name,login_dt) VALUES ?",
    [encryped_users.map((x) => Object.values(x))]
  );
}

async function createFakeData() {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }
  const conn = await pool.getConnection();
  await conn.query("START TRANSACTION");
  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await _createFakeUser(conn);

  await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await conn.query("COMMIT");
  await conn.release();
}

async function truncateFakeData() {
  if (NODE_ENV !== "test") {
    console.log("Not in test env");
    return;
  }

  const truncateTable = async (table) => {
    const conn = await pool.getConnection();
    await conn.query("START TRANSACTION");
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 0);
    await conn.query(`TRUNCATE TABLE ${table}`);
    await conn.query("SET FOREIGN_KEY_CHECKS = ?", 1);
    await conn.query("COMMIT");
    await conn.release();
    return;
  };

  const tables = ["users"];
  for (let table of tables) {
    await truncateTable(table);
  }

  return;
}

async function closeConnection() {
  return await pool.end();
}

async function main() {
  await truncateFakeData();
  await createFakeData();
  await closeConnection();
}

// execute when called directly.
if (require.main === module) {
  main();
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection,
};
