require("dotenv").config();
const mysql = require("mysql2/promise");
const multipleStatements = process.env.NODE_ENV === "test";
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_DATABASE_TEST } =process.env;

const mysqlConfig = {
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
};

let mysqlEnv = mysqlConfig;
mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;

const pool = mysql.createPool(mysqlEnv, { multipleStatements });

module.exports = {
  pool,
};
