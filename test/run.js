require('./env').set_auth()
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var robinhood = require('../service/robinhood')
var _ = require('lodash')
var fs = require('fs')
const path = require("path");
var records = []

var run = async function(){
    var holding = false;
    var r = await (new robinhood.Robinhood()).init()
    var coin_symbol = 'BTC'
    var dollars_buy = 5

    var coin = r.watch_crypto(coin_symbol)
    
    while(true){
        var  _coin = (await coin.next()).value
        var date = moment().format()
        _coin.date = date
        _coin.state = 'not_holding'
        // if(_doge.delta_percent)
        
        if(_coin.window_delta_percent < -0.0000 && !holding){
            var quantity = (dollars_buy /_coin.ask_price).toFixed(8)
            var buy = {
                symbol: coin_symbol,
                price: _coin.ask_price,
                quantity: quantity ,
                side:'buy',
                total: quantity * _coin.ask_price
            }
            console.log('buy',buy)
            var res = await r.order(buy)
            console.log(res)
            _coin.state = 'holding'
            if(res){
                holding = buy
            }
        }
        
        var sell = {
            symbol: coin_symbol,
            price: _coin.bid_price,
            quantity: holding.quantity,
            side:'sell',
            total: holding.quantity * _coin.bid_price
        }

        console.log(
            {
                since_start: _coin.delta_percent.toFixed(8),
                window: _coin.window_delta_percent.toFixed(8),
                return: sell.total - holding.total,
                return_percent: ((sell.total - holding.total) / holding.total) * 100
            }
             )
        if(holding && (sell.total - holding.total) > 0.01){
            console.log('sell', sell)
            var res = await r.order(sell)
            console.log(res)
            console.log('made',sell.total - buy.total)
            break
        }

        records.push(_coin)
    
        const csvWriter = createCsvWriter({
            path: path.resolve(__dirname, "./res.csv"),
            header: Object.keys(records[0]).map(k=>{
                return {id: k, title: k}
            })
        });
        await csvWriter.writeRecords(records)
    }
    run()
}


// var run = async function(){
//     var r = await (new robinhood.Robinhood()).init()
//     var btc = r.watch_crypto('BTC')
//     var doge = r.watch_crypto('DOGE')
//     var records = []
//     for (var i in _.range(0,300)){
//         var [_btc, _doge] = (await Promise.all([btc.next(), doge.next()])).map(d=>{return d.value})
//         console.log(i)
//         var date = moment().format()
//         _btc.date = date
//         _doge.date = date
//         records.push(_btc)
//         records.push(_doge)
//     }
//     const csvWriter = createCsvWriter({
//         path: path.resolve(__dirname, "./res.csv"),
//         header: Object.keys(records[0]).map(k=>{
//             return {id: k, title: k}
//         })
//     });
//     await csvWriter.writeRecords(records)
// }

run()