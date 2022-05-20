require("dotenv").config();
const { expect, requester } = require("./set_up");
const { users } = require("./fake_data");
const { pool } = require("../server/models/mysqlcon");
const User = require("../server/models/user_model");

const expectedExpireTime = process.env.TOKEN_EXPIRE;

describe("SIGN UP", () => {
  it("sign up", async () => {
    const user = {
      name: "arthur",
      email: "arthur@gmail.com",
      password: "password",
    };

    const data = await User.signUp(user.name, user.email, user.password);

    const userExpected = {
      access_token: data.user.access_token, // need id from returned data
      name: user.name,
      email: user.email,
      password: data.user.password,
      login_dt: data.user.login_dt,
      picture: data.user.picture,
    };

    expect(data.user).to.deep.equal(userExpected);
  });

  it("sign up with existed email", async () => {
    const user1 = {
      email: "arthur@gmail.com",
      password: "password",
      name: null,
    };

    const res1 = await User.signUp(user1.name, user1.email, user1.password);

    expect(res1.error).to.equal("Email Already Exists");
  });
});

describe("SIGN IN", () => {
  it("native sign in with correct password", async () => {
    const user1 = users[0];
    const user = {
      name: user1.name,
      email: user1.email,
      password: user1.password,
    };

    const data = await User.nativeSignIn(user1.email, user1.password);

    const userExpect = {
      access_token: data.user.access_token, // need id from returned data
      access_expired: data.user.access_expired, // need id from returned data
      create_dt: data.user.create_dt, // need id from returned data
      id: data.user.id, // need id from returned data
      name: user.name,
      email: user.email,
      password: data.user.password,
      login_dt: data.user.login_dt,
      picture: data.user.picture,
    };

    expect(data.user).to.deep.equal(userExpect);

    // make sure DB is changed, too
    const loginTime = await pool.query(
      "SELECT login_dt FROM users WHERE email = ?",
      [user.email]
    );

    expect(new Date(data.user.login_dt).getTime()).to.closeTo(Date.now(), 1000);
    expect(new Date(loginTime[0][0].login_dt).getTime()).to.closeTo(
      Date.now(),
      1000
    );
  });

  it("native sign in without email or password", async () => {
    const user1 = users[0];
    const userNoEmail = {
      email: null,
      password: user1.password,
    };

    const res1 = await User.nativeSignIn(
      userNoEmail.email,
      userNoEmail.password
    );

    expect(res1.status_code).to.equal(4030);
    expect(res1.error).to.equal("Email or password is wrong");

    const userNoPassword = {
      email: user1.email,
      password: null,
    };

    const res2 = await User.nativeSignIn(
      userNoEmail.email,
      userNoEmail.password
    );

    expect(res1.status_code).to.equal(4030);
    expect(res1.error).to.equal("Email or password is wrong");
  });

  it("native sign in with wrong password", async () => {
    const user1 = users[0];
    const user = {
      email: user1.email,
      password: "wrong password",
    };

    const res = await User.nativeSignIn(user.email, user.password);

    expect(res.status_code).to.equal(4030);
    expect(res.error).to.equal("Email or password is wrong");
  });

  it("native sign in with malicious password", async () => {
    const user1 = users[0];
    const user = {
      email: user1.email,
      password: '" OR 1=1; -- ',
    };

    const res = await User.nativeSignIn(user.email, user.password);

    expect(res.status_code).to.equal(4030);
    expect(res.error).to.equal("Email or password is wrong");
  });

});
