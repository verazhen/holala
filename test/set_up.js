const app = require("../app");
const chai = require("chai");
const { NODE_ENV } = process.env;
const { truncateFakeData, createFakeData } = require("./fake_data_generator");

const assert = chai.assert;
const expect = chai.expect;

before(async () => {
  if (NODE_ENV !== "test") {
    throw "Not in test env";
  }

  await truncateFakeData();
  await createFakeData();
});

module.exports = {
  expect,
  assert,
};
