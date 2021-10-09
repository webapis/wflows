

const { puppeteerCrawler } = require('./index')

const { handlePageFunction } = require('./books')

puppeteerCrawler({ handlePageFunction, headless: true, preNavHook: null, postNavHook: null,
    
    urls: [{ url: 'https://books.toscrape.com/catalogue/category/books/religion_12/index.html', userData: {}, batchName: 'books', unshift: false, retry: false, retries: 0, sync: false }],
 
    batches: [{ batchName: 'books', concurrencyLimit: 20, retries: 3 }] })
