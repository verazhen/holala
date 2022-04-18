const {pool} = require('./mysqlcon');
const got = require('got');


const getReport = async () => {
    const [orders] = await pool.query('SELECT * FROM order_table');
    return orders;
};

const getCode = async (colorName) => {
    const [[color]] = await pool.query(`SELECT code FROM color WHERE name = "${colorName}"`);
    return color.code;
};

module.exports = {
    getReport,
    getCode
};