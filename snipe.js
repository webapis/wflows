

const { puppeteerCrawler } = require('./index')

const { handlePageFunction } = require('./books')

puppeteerCrawler({ handlePageFunction, headless: false, preNavHook: null, postNavHook: null,
    
    urls: [{ url: 'https://books.toscrape.com/', userData: '', batchName: 'books', unshift: false, retry: false, retries: 0, sync: false }],
 
    batches: [{ batchName: 'books', concurrencyLimit: 2, retries: 3 }] })
