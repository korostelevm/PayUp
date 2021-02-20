require('./env').set_auth()
var robinhood = require('../service/robinhood')
jest.setTimeout(30000);
var fs = require('fs')
const path = require("path");

describe("", () => {
    test("auth", async () => {
      var res = await robinhood.auth()
      console.log(res)
      fs.writeFileSync(path.resolve(__dirname, "./robinhood_res.json"), JSON.stringify(res, null, 2))
    });
  });

describe("", () => {
    test("quote", async () => {
      var res = await robinhood.quote('DOGE')
      console.log(res)
    //   fs.writeFileSync(path.resolve(__dirname, "./robinhood_res.json"), JSON.stringify(res, null, 2))
    });
  });