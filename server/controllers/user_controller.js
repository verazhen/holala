require("dotenv").config();
const validator = require("validator");
const User = require("../models/user_model");

const signUp = async (req, res) => {
  const { data } = req.body;

  let { name } = data;
  const { email, password } = data;

  if (!name || !email || !password) {
    res.status(400).send({
      status_code: 400,
      error: "Request Error: name, email and password are required.",
    });
    return;
  }

  if (!validator.isEmail(email)) {
    res
      .status(400)
      .send({ status_code: 400, error: "Request Error: Invalid email format" });
    return;
  }

  name = validator.escape(name);

  const result = await User.signUp(name, email, password);
  if (result.error) {
    res.status(403).send({ status_code: 403, error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({ status_code: 500, error: "Database Query Error" });
    return;
  }

  res.status(200).send({
    status_code: 200,
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_at: user.created_dt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const nativeSignIn = async (email, password) => {
  if (!email || !password) {
    return {
      error: "Request Error: email and password are required.",
      status: 400,
    };
  }

  try {
    return await User.nativeSignIn(email, password);
  } catch (error) {
    return { error };
  }
};

const signIn = async (req, res) => {
  const { data } = req.body;

  let result;
  result = await nativeSignIn(data.email, data.password);

  if (result.error) {
    const status_code = result.status ? result.status : 403;
    res.status(status_code).send({ status_code: 4030, error: result.error });
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({
      status_code: 500,
      error: "Database Query Error",
    });
    return;
  }

  res.status(200).send({
    status_code: 200,
    data: {
      access_token: user.access_token,
      access_expired: user.access_expired,
      login_dt: user.login_dt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

module.exports = {
  signUp,
  signIn,
};
