const { promiseEventTypes } = require('../promise-concurrency')
const { uuidv4 } = require('../uuidv4')
const requestQueue = {

    push: function ({ url, userData, batchName, unshift=false ,sync=false}) {
        const uuid = uuidv4()
        const eventEmitter = global.puppeteer_eventEmitter;
 
        eventEmitter.emit(promiseEventTypes.PROMISE_ATTACHED, { batchName, uuid, props: { userData,url }, unshift, retry: false, retries: 0,sync })
        
    }
}


module.exports = { requestQueue }