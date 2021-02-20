require('./env').set_auth()
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var robinhood = require('../service/robinhood')
var _ = require('lodash')
jest.setTimeout(90000);
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
        var btc = r.watch_crypto('BTC')
        var doge = r.watch_crypto('DOGE')
        var records = []
        for (var i in _.range(0,100)){
            var [_btc, _doge] = (await Promise.all([btc.next(), doge.next()])).map(d=>{return d.value})
            console.log(i)
            records.push(_btc)
            records.push(_doge)
        }
        const csvWriter = createCsvWriter({
            path: path.resolve(__dirname, "./res.csv"),
            header: Object.keys(records[0]).map(k=>{
                return {id: k, title: k}
            })
        });
        await csvWriter.writeRecords(records)


        // console.log(deltas)
        // console.log(_.max(deltas),_.min(deltas))
    });    
  });