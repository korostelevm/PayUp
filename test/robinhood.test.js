require('./env').set_auth()
var robinhood = require('../service/robinhood')
var _ = require('lodash')
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
      var res = await robinhood.quote_stock('AMZN')
      console.log(res)
      fs.writeFileSync(path.resolve(__dirname, "./robinhood_quote_res.json"), JSON.stringify(res, null, 2))
    });
  });

describe("", () => {
    test("crypto", async () => {
      var res = await robinhood.quote_crypto('DOGE')
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

describe("", () => {
    test("class", async () => {
        var r = await (new robinhood.Robinhood()).init()
        var q = r.watch_crypto('DOGE')
        for (var i in _.range(0,15)){
            var res = (await q.next())
            console.log(res.value)
        }
    });    
  });