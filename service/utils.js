// var poll = async function (fn, timeout, interval) {
//     var endTime = Number(new Date()) + (timeout || 2000);
//     interval = interval || 100;

//     var checkCondition = async function(resolve, reject) {
//         // If the condition is met, we're done! 
//         var result = await fn();
//         if (Number(new Date()) < endTime) {
//             setTimeout(checkCondition, interval, resolve, reject);
//         }
//         // Didn't match and too much time, reject!
//         else {
//             reject(new Error('timed out for ' + fn + ': ' + arguments));
//         }
//     };

//     return new Promise(checkCondition);
// }

async function *poll(fn,args){
    while(true){
      yield await fn(...args)
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

module.exports = {
    sleep
}