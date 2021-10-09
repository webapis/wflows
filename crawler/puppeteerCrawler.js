const puppeteer = require('puppeteer');
const { promiseConcurrency, promiseEventTypes } = require('../promise-concurrency');
const { pageController } = require('./pageController')
const { requestQueue } = require('./requestQueue')
const { uuid, uuidv4 } = require('../uuidv4')
const { URL } = require('url')

async function puppeteerCrawler({ handlePageFunction, headless, preNavHook, postNavHook, urls, batches }) {

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless, isMobile: false, args: [
            `--window-size=${2554},${2302}`
        ], defaultViewport: {
            width: 2554,
            height: 2302
        }
    });
    let eventEmitter = promiseConcurrency({ taskName: 'puppeteer' });

    eventEmitter.on(promiseEventTypes.RUN_NEXT_PROMISE, async (props) => {

        await pageController({ handlePageFunction, preNavHook, postNavHook, browser, ...props })
    })
    eventEmitter.on(promiseEventTypes.QUEUE_EMPTY, async() => {
        await browser.close()
        process.exit(0)
    })
    batches.forEach(batch => {
        const { batchName, concurrencyLimit, retries } = batch;

        eventEmitter.emit(promiseEventTypes.BATCH_NAME_REGISTERED, { batchName, concurrencyLimit, retries })
    })

    urls.forEach(props => {
        const uuid = uuidv4()

        requestQueue.push({ ...props, uuid })
    })



}

module.exports = { puppeteerCrawler }