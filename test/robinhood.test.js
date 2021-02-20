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
      var res = await robinhood.quote('AMZN')
      console.log(res)
      fs.writeFileSync(path.resolve(__dirname, "./robinhood_quote_res.json"), JSON.stringify(res, null, 2))
    });
  });

describe("", () => {
    test("crypto", async () => {
      var res = await robinhood.crypto('DOGE')
      console.log(res)
      fs.writeFileSync(path.resolve(__dirname, "./robinhood_crypto_res.json"), JSON.stringify(res, null, 2))
    });
  });

describe("", () => {
    test("sell", async () => {
      var res = await robinhood.sell('DOGE')
      console.log(res)
      fs.writeFileSync(path.resolve(__dirname, "./robinhood_sell_res.json"), JSON.stringify(res, null, 2))
    });
  });

describe("", () => {
    test("buy", async () => {
      var res = await robinhood.buy('DOGE')
      console.log(res)
      fs.writeFileSync(path.resolve(__dirname, "./robinhood_buy_res.json"), JSON.stringify(res, null, 2))
    });
  });