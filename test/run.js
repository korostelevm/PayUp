require('./env').set_auth()
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var robinhood = require('../service/robinhood')
var _ = require('lodash')
var fs = require('fs')
const path = require("path");

var run = async function(){
    var r = await (new robinhood.Robinhood()).init()
    var btc = r.watch_crypto('BTC')
    var doge = r.watch_crypto('DOGE')
    var records = []
    for (var i in _.range(0,300)){
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
}

run()