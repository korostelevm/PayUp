const rax = require('retry-axios');
var axios = require('axios')
const qs = require('qs');
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  
const client = async function () {
    try {
        var res = await axios({
            // httpsAgent: agent,
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
            }
        })
   
    } catch (e) {
        console.error(e.config)
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
    var account = (await nummus.get(`accounts/`)).data.results[0]
    return {api,nummus,account }
}

var quote = async function(symbol){
    var robinhood = await client()
    try{
        var res = (await robinhood.api.get(`quotes/?symbols=${symbol}`)).data.results
    }catch(e){
        console.log(e.config)
        console.error(e.response.data)
    }
    return res

}
var crypto = async function(symbol){
    var robinhood = await client()
    var currency_pairs = (await axios.get('https://nummus.robinhood.com/currency_pairs/')).data.results
    console.log(currency_pairs)
    var crypto_id = currency_pairs.filter(c=>{return c.asset_currency.code == symbol})[0].id
    var res = (await robinhood.api.get(`marketdata/forex/quotes/${crypto_id}/`)).data
      return res
}

var sell = async function(symbol){
    var robinhood = await client()
    
    var currency_pairs = (await axios.get('https://nummus.robinhood.com/currency_pairs/')).data.results
    var crypto_id = currency_pairs.filter(c=>{return c.asset_currency.code == symbol})[0].id

    try{
        var res =( await robinhood.nummus.post('orders/',{
            account_id: robinhood.account.id,
            currency_pair_id: crypto_id,
            price: "0.055",
            quantity: "10",
            ref_id: uuidv4(),
            side: "sell",
            time_in_force: "gtc",
            type: "market",
        })).data
    }
    catch(e){
        console.log(e.response.data)
    }


    return res

}

var buy = async function(symbol){
    var robinhood = await client()
    
    var currency_pairs = (await axios.get('https://nummus.robinhood.com/currency_pairs/')).data.results
    var crypto_id = currency_pairs.filter(c=>{return c.asset_currency.code == symbol})[0].id

    try{
        var res =( await robinhood.nummus.post('orders/',{
            account_id: robinhood.account.id,
            currency_pair_id: crypto_id,
            price: "0.055",
            quantity: "10",
            ref_id: uuidv4(),
            side: "buy",
            time_in_force: "gtc",
            type: "market",
        })).data
    }
    catch(e){
        console.log(e.response.data)
    }


    return res

}

module.exports = {
    client,
    quote,
    crypto,
    sell,
    buy
}