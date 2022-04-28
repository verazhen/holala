require("dotenv").config();
// const got = require("got");
const { pool } = require("./mysqlcon");
const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const { jwt, bcrypt } = require("../../util/authTool");

const signUp = async (name, email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const emails = await conn.query(
      "SELECT email FROM users WHERE email = ? " /* FOR UPDATE */,
      [email]
    );
    if (emails[0].length > 0) {
      await conn.query("COMMIT");
      return { error: "Email Already Exists" };
    }

    const loginDt = new Date();
    const hashedPassword = await bcrypt.hashAsync(password, salt);
    const user = {
      email,
      password: hashedPassword,
      name: name,
      picture: null,
      login_dt: loginDt,
    };

    const [result] = await conn.query("INSERT INTO users SET ?", user);

    const accessToken = await jwt.asyncSign(
      {
        id: result.insertId,
        name: user.name,
      },
      TOKEN_SECRET
    );

    user.access_token = accessToken;

    await conn.query("COMMIT");
    return { user };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

const nativeSignIn = async (email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const [[user]] = await conn.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const hashedPwd = await bcrypt.compareAsync(password, user.password);

    if (!hashedPwd) {
      await conn.query("COMMIT");
      return { error: "Password is wrong" };
    }

    const loginDt = new Date();

    await conn.query("UPDATE users SET login_dt = ? WHERE uid = ?", [
      loginDt,
      user.id,
    ]);

    const accessToken = await jwt.asyncSign(
      {
        id: user.id,
        name: user.name,
      },
      TOKEN_SECRET
    );

    await conn.query("COMMIT");

    user.access_token = accessToken;
    user.login_dt = loginDt;
    user.access_expired = TOKEN_EXPIRE;

    return { user };
  } catch (error) {
    console.log(error);
    await conn.query("ROLLBACK");
    return { error };
  } finally {
    await conn.release();
  }
};

module.exports = {
  signUp,
  nativeSignIn,
};
