const rax = require('retry-axios');
const moment = require('moment');
var axios = require('axios')
const qs = require('qs');
var _ = require('lodash')
var utils =  require('./utils');
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
class Robinhood {

    constructor() {
    }
    

    
    async init(){
        try {
            var res = await axios({
                method: 'post',
                url: `https://api.robinhood.com/oauth2/token/`,
                data: {
                    "client_id": "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS",
                    "device_token":process.env.robinhood_device_token,
                    "expires_in": 86400,
                    "grant_type": "password",
                    "password": process.env.robinhood_password,
                    "scope": "internal",
                    "username": process.env.robinhood_username,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                raxConfig: {
                    retry: 5,
                    retryDelay: _.random(500),
                    httpMethodsToRetry: ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT'],
                    statusCodesToRetry: [[403]],
                    backoffType: 'exponential',
                    onRetryAttempt: err => {
                      const cfg = rax.getConfig(err);
                      console.log(`Retry attempt #${cfg.currentRetryAttempt}`);
                    }
                  }
            })
       
        } catch (e) {
            // console.error(e.config)
            console.error(e.response.data)
            throw e
        }
    
        var api = axios.create({
            baseURL: `https://api.robinhood.com/`,
            timeout: 30000,
            headers: {
              'Authorization': `Bearer ${res.data.access_token}`,
            }
          });
    
        var nummus = axios.create({
            baseURL: `https://nummus.robinhood.com/`,
            timeout: 30000,
            headers: {
              'Authorization': `Bearer ${res.data.access_token}`,
            }
          });
        this.account = (await nummus.get(`accounts/`)).data.results[0]
        this.client = {api,nummus}
        this.currency_pairs = (await axios.get('https://nummus.robinhood.com/currency_pairs/')).data.results
        // console.log(this.currency_pairs)
        return this
    }

    async quote_stock(symbol){
        try{
            var res = (await this.client.api.get(`quotes/?symbols=${symbol}`)).data.results
        }catch(e){
            console.log(e.config)
            console.error(e.response.data)
        }
        return res
    }

    
    async crypto_holdings(){
        try{
            var res = (await this.client.nummus.get(`/holdings/`)).data.results
        }catch(e){
            console.log(e)
        }
        return res
    }
    
    async crypto_quote(symbol){
        var crypto_id = this.currency_pairs.filter(c=>{return c.asset_currency.code == symbol})[0].id
        try{
            var res = (await this.client.api.get(`marketdata/forex/quotes/${crypto_id}/`)).data
        }catch(e){
            console.log(e)
        }
        return res
    }

    
    async *watch_crypto(symbol){
        await utils.sleep(1000)
        // var holdings = await this.crypto_holdings()
        // var holding = holdings.filter(c=>{return c.currency.code == symbol})[0]
        var holding = {
            quantity_available:1
        }
        var quote0 = await this.crypto_quote(symbol)
        holding.value0 = holding.quantity_available * quote0.ask_price
        var window = [holding.value0]
        while(true){
            await utils.sleep(500)
            try{
                var quote = await this.crypto_quote(symbol)
            }catch(e){
                console.log(e.response)
                throw e
            }
            var new_value = holding.quantity_available * quote.ask_price
            quote.delta = new_value - holding.value0
            quote.delta_percent =  (quote.delta /  holding.value0 )*100 

            window.push(new_value)
            quote.window_delta = _.mean(window.map(w=>{ return new_value - w}))
            quote.window_delta_percent = (quote.window_delta /  window[0] )*100 
            if(window.length > 20){
                quote.half_window_delta_percent = ((new_value - window[9])/window[9])*100 
                window.shift()
            }
            // console.log(window)
            yield quote
        }
    }


    async track_order(order,timeout){
        return new Promise(async (resolve,reject)=>{
            var done = false;
            var tries = 0
            do{
                var status =( await this.client.nummus.get(`orders/${order.id}/`)).data
                if(['filled','canceled'].includes(status.state) ){
                    console.log(status.state)
                    done = status
                }else if(tries >=timeout){
                    console.log('Timed out, cancelling order')
                    done = ( await this.client.nummus.post(`orders/${order.id}/cancel/`)).data
                    await this.track_order(order,60)
                }else{
                    tries+=1
                    console.log('waiting',status.state, tries)
                    await utils.sleep(1000)
                }
            }while(!done)
            return resolve(done)

        })
    }

    async order(params){
        var crypto = this.currency_pairs.filter(c=>{return c.asset_currency.code == params.symbol})[0]
        var account_id = this.account.id
        var price = Math.round (params.price * (1/crypto.min_order_price_increment)) / (1/crypto.min_order_price_increment)
        var quantity = Math.round (params.quantity * (1/crypto.min_order_quantity_increment)) / (1/crypto.min_order_quantity_increment)
        console.log(quantity)
        try{
            var res =( await this.client.nummus.post('orders/',{
                account_id: account_id,
                currency_pair_id: crypto.id,
                price: price.toString(),
                quantity: quantity.toString(),
                ref_id: uuidv4(),
                side: params.side,
                time_in_force: "gtc",
                type: "market",
            })).data
        }
        catch(e){
            console.log(e.config)
            console.log(e.response.data)
            // if(e.response.data.quantity && e.response.data.quantity == ['Order quantity is too small.']){
            // }
            console.log(crypto)
            return false
        }
        return res
    }


  }



module.exports = {
    Robinhood
}