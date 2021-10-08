const puppeteer = require('puppeteer');
const { promiseConcurrency, promiseEventTypes } = require('../promise-concurrency');
const { pageController } = require('./pageController')
const { requestQueue } = require('./requestQueue')
const { URL } = require('url')

async function puppeteerCrawler({ handlePageFunction, headless, preNavHook, postNavHook, urls,batches }) {

    const browser = await puppeteer.launch({
        headless, isMobile: false, args: [
            `--window-size=${2554},${2302}`
        ], defaultViewport: {
            width: 2554,
            height: 2302
        }
    });
    let eventEmitter = promiseConcurrency({ taskName: 'puppeteer' });

    eventEmitter.on(promiseEventTypes.RUN_NEXT_PROMISE, async ({ batchName, props, uuid,unshift }) => {
        debugger;
        await pageController({ handlePageFunction, preNavHook, postNavHook, props, batchName, uuid,browser,unshift })
    })

    batches.forEach(batch=>{
        const {batchName, concurrencyLimit, retries}=batch;
    
        eventEmitter.emit(promiseEventTypes.BATCH_NAME_REGISTERED,{ batchName, concurrencyLimit, retries })
    })

    urls.forEach(data => {
        const { url, userData, batchName, unshift ,sync} = data
        requestQueue.push({ url, userData, batchName, unshift ,sync})
    })



}

module.exports = { puppeteerCrawler }