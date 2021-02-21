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
    test("buy", async () => {
        var r = await (new robinhood.Robinhood()).init()
        var symbol = 'DOGE'
        var quote = await r.crypto_quote(symbol)
        console.log(quote)
        var sell_order = {
            symbol: 'DOGE',
            price: quote.bid_price,
            quantity: 9.99,
            side:'buy',
        }
        var order = await r.order(sell_order)
        var res = await r.track_order(order,5)
        console.log(res)
        fs.writeFileSync(path.resolve(__dirname, "./robinhood_order.json"), JSON.stringify(res, null, 2))
    });
  });

describe("", () => {
    test("track_order", async () => {
        var r = await (new robinhood.Robinhood()).init()
        var res = await r.track_order( {
            account_id: 'ac83d858-a6f3-48e3-a448-ae6cb1ce8a59',
            average_price: '0.054765000000000000',
            cancel_url: null,
            created_at: '2021-02-21T07:43:08.574435-05:00',
            cumulative_quantity: '10.000000000000000000',
            currency_pair_id: '1ef78e1b-049b-4f12-90e5-555dcf2fe204',
            executions: [
              {
                effective_price: '0.054765000000000000',
                id: 'dcca6874-4409-40d1-ba36-16b7f15ae102',
                quantity: '10.000000000000000000',
                timestamp: '2021-02-21T07:43:09.956000-05:00'
              }
            ],
            id: '6032555c-84ef-43b2-bccc-d1083054f49f',
            last_transaction_at: '2021-02-21T07:43:09.956000-05:00',
            price: '0.054765000000000000',
            quantity: '10.000000000000000000',
            ref_id: 'd9bad33f-6f27-4a4b-b482-4954c23de661',
            rounded_executed_notional: '0.54',
            side: 'sell',
            state: 'filled',
            time_in_force: 'gtc',
            type: 'market',
            updated_at: '2021-02-21T07:43:10.665910-05:00'
          }
      ,3)
        console.log(res)
        fs.writeFileSync(path.resolve(__dirname, "./robinhood_order.json"), JSON.stringify(res, null, 2))
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