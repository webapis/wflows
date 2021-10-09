const { promiseEventTypes } = require('../promise-concurrency')
const { uuidv4 } = require('../uuidv4')
const requestQueue = {

    push: function (props) {
        const uuid = uuidv4()
        const eventEmitter = global.puppeteer_eventEmitter;

        eventEmitter.emit(promiseEventTypes.PROMISE_ATTACHED, { ...props, uuid, retry: false, retries: 0 })

    }
}


module.exports = { requestQueue }