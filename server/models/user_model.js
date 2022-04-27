require("dotenv").config();
// const got = require("got");
const { pool } = require("./mysqlcon");
const salt = parseInt(process.env.BCRYPT_SALT);
const { TOKEN_EXPIRE, TOKEN_SECRET } = process.env; // 30 days by seconds
const { jwt, bcrypt } = require("../../util/util");

const signUp = async (name, email, password) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");

    const emails = await conn.query(
      "SELECT email FROM users WHERE email = ? ",/* FOR UPDATE */
      [email]
    );
    if (emails[0].length > 0) {
      await conn.query("COMMIT");
      return { error: "Email Already Exists" };
    }

    const loginDt = new Date();
    const hashedPassword = await bcrypt.hashAsync(password, salt);
    console.log(hashedPassword);
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
      },
      TOKEN_SECRET
    );

    console.log(accessToken);

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
//
// const nativeSignIn = async (email, password) => {
//   const conn = await poolWrite.getConnection();
//   try {
//     await conn.query("START TRANSACTION");
//
//     const [[user]] = await conn.query("SELECT * FROM users WHERE email = ?", [
//       email,
//     ]);
// //     const user = users[0];
//     if (!bcrypt.compareAsync(password, user.password)) {
//       await conn.query("COMMIT");
//       return { error: "Password is wrong" };
//     }
//
//     const loginAt = new Date();
//     const accessToken = jwt.asyncSign(
//       {
//         name: user.name,
//         email: user.email,
//         picture: user.picture,
//       },
//       TOKEN_SECRET
//     );
//
//     const queryStr =
//       "UPDATE users SET access_token = ?, access_expired = ?, login_at = ? WHERE uid = ?";
//     await conn.query(queryStr, [accessToken, TOKEN_EXPIRE, loginAt, user.id]);
//
//     await conn.query("COMMIT");
//
//     user.access_token = accessToken;
//     user.login_at = loginAt;
//     user.access_expired = TOKEN_EXPIRE;
//
//     return { user };
//   } catch (error) {
//     await conn.query("ROLLBACK");
//     return { error };
//   } finally {
//     await conn.release();
//   }
// };

module.exports = {
  signUp,
  //   nativeSignIn,
};
