const { promiseEventTypes } = require('../promise-concurrency')
const { uuidv4 } = require('../uuidv4')

//enqueues urls for processing
//tracks urls and prevents dublicate urls


async function enqueueLink({ selector, page, userData,url, batchName, unshift ,sync }) {
    try {
        const links = await page.$(selector)
        if (links) {
        
            const urls = await page.$$eval(selector, els => els.map(el => el.href))
            const eventEmitter = global.puppeteer_eventEmitter;
          //  const withoutDublicate = removeDublicateArrayValues()
            urls.forEach(u => {
                const uuid = uuidv4()
                eventEmitter.emit(promiseEventTypes.PROMISE_ATTACHED, { batchName, uuid, props: { userData,url }, unshift, retry: false, retries: 0,sync })
            })
        }
    
    } catch (error) {
        console.log(error)
        process.exit(1)
        
    }
}

module.exports = { enqueueLink }