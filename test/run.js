require('./env').set_auth()
const moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var robinhood = require('../service/robinhood')
var utils = require('../service/utils')
var _ = require('lodash')
var fs = require('fs')
const path = require("path");
var records = []

var run = async function(){
    var r = await (new robinhood.Robinhood()).init()
    var coin_symbol = 'ETC'
    var dollars_buy = 10
    
    var coin = r.watch_crypto(coin_symbol)
    var keys = Object.keys((await coin.next()).value).map(k=>{
        return {id: k, title: k}
    })
    keys = keys.concat([
        'since_start',
        'window',
        'return',
        'return_percent',
        'state',
        'date'
    ].map(k=>{return {id:k, title:k}}))
    var csvWriter;
    var csv_file =  "./"+coin_symbol+"2.csv"
    try{
        var state = fs.readFileSync(path.resolve(__dirname, csv_file))
        csvWriter = createCsvWriter({
            path: path.resolve(__dirname, csv_file),
            header: keys,
            append:true
        });
    }catch(e){
        if(e.message.includes('no such file or directory')){
            csvWriter = createCsvWriter({
                path: path.resolve(__dirname, csv_file),
                header: keys,
            });
        }else{
            throw(e)
        }
    }
    
    var holding = false;
    try{
        var state = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./holding_state${coin_symbol}.json`)))
        if(state.state == 'holding'){
            holding = state
        }
    }catch(e){
        if(e.message.includes('no such file or directory')){
            console.log('No previous state')
        }else{ throw e }
    }
    while(true){
        var  _coin = (await coin.next()).value
        var date = moment().format()
        _coin.date = date
        _coin.state = 'not_holding'
        if(  _coin.window_delta_percent < -0.1 && !holding){
            var buy = {
                symbol: coin_symbol,
                price: _coin.ask_price,
                quantity: dollars_buy/_coin.ask_price,
                side:'buy',
                total: dollars_buy
            }
            console.log('buy',buy)
            var res = await r.order(buy)
            console.log(res)
            var tracker = await r.track_order(res,180)
            if(res && tracker.state == 'filled'){
                holding = buy
                holding.quantity = +res.quantity
                holding.total = +((+res.quantity * +res.price).toFixed(2))
            }else{
                holding = {}
            }
        }
        if(holding){
            _coin.state = 'holding'
        }
        var sell = {
            symbol: coin_symbol,
            price: _coin.bid_price,
            quantity: holding.quantity,
            side:'sell',
            total: holding.quantity * _coin.bid_price
        }

        var status = {
            ..._coin,
            quantity: holding.quantity,
            total: holding.total,
            since_start: _coin.delta_percent.toFixed(8),
            window: _coin.window_delta_percent.toFixed(8),
            return: sell.total - holding.total,
            return_percent: ((sell.total - holding.total) / holding.total) * 100
        }
        console.log(status)
        if( holding && (sell.total - holding.total) > 0.01){
            console.log('sell', sell)
            var res = await r.order(sell)
            console.log('made',sell.total - status.total)
            var tracker = await r.track_order(res,180)
            if(tracker.state == 'filled'){
                _coin.state = 'not_holding'
                status.state = 'not_holding'
            }
            if(res){
                fs.writeFileSync(path.resolve(__dirname, `./holding_state${coin_symbol}.json`), JSON.stringify(status, null, 2))
                break
            }
            console.log(res)
        }
        
        fs.writeFileSync(path.resolve(__dirname, `./holding_state${coin_symbol}.json`), JSON.stringify(status, null, 2))
    
        await csvWriter.writeRecords([status])
    }
    await utils.sleep(15000)
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