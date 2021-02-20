const rax = require('retry-axios');
var axios = require('axios')
const qs = require('qs');
const auth = async function () {
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
        return res.data
    } catch (e) {
        console.error(e.config)
        console.error(e.response.data)
        throw e
    }
}

var quote = async function(symbol){
    var a = await auth()

    // Request URL: https://nummus.robinhood.com/currency_pairs/
    var res = (await axios.get('https://nummus.robinhood.com/currency_pairs/')).data.results

    // const robinhood = axios.create({
    //     baseURL: `https://api.robinhood.com/`,
    //     timeout: 30000,
    //     headers: {
    //       'Authorization': `Bearer ${a.access_token}`,
    //     }
    //   });
    //   try{
    //       var res = (await robinhood.get(`quotes/?symbols=${symbol}`)).data.results
    //   }catch(e){
    //       console.log(e.config)
    //       console.error(e.response.data)
    //   }
      return res

}

module.exports = {
    auth,
    quote
}