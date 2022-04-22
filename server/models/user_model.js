require('dotenv').config();
const bcrypt = require('bcrypt');
const got = require('got');
const {poolRead, poolWrite} = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const {TOKEN_EXPIRE, TOKEN_SECRET} = process.env; // 30 days by seconds
const jwt = require('jsonwebtoken');


const signUp = async (name, email, password) => {
    const conn = await poolRead.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const emails = await conn.query('SELECT email FROM users WHERE email = ? FOR UPDATE', [email]);
        if (emails[0].length > 0){
            await conn.query('COMMIT');
            return {error: 'Email Already Exists'};
        }

        const loginAt = new Date();

        const user = {
            email: email,
            password: bcrypt.hashSync(password, salt),
            name: name,
            picture: null,
            access_expired: TOKEN_EXPIRE,
            login_at: loginAt
        };
        const accessToken = jwt.sign({
            provider: user.provider,
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);
        user.access_token = accessToken;

        const queryStr = 'INSERT INTO users SET ?';
        const [result] = await conn.query(queryStr, user);

        user.id = result.insertId;
        await conn.query('COMMIT');
        return {user};
    } catch (error) {
        console.log(error);
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};

const nativeSignIn = async (email, password) => {
    const conn = await poolWrite.getConnection();
    try {
        await conn.query('START TRANSACTION');

        const [[user]] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (!bcrypt.compareSync(password, user.password)){
            await conn.query('COMMIT');
            return {error: 'Password is wrong'};
        }

        const loginAt = new Date();
        const accessToken = jwt.sign({
            name: user.name,
            email: user.email,
            picture: user.picture
        }, TOKEN_SECRET);

        const queryStr = 'UPDATE users SET access_token = ?, access_expired = ?, login_at = ? WHERE uid = ?';
        await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);

        await conn.query('COMMIT');

        user.access_token = accessToken;
        user.login_at = loginAt;
        user.access_expired = TOKEN_EXPIRE;

        return {user};
    } catch (error) {
        await conn.query('ROLLBACK');
        return {error};
    } finally {
        await conn.release();
    }
};


module.exports = {
    signUp,
    nativeSignIn,
};