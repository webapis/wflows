
const { enqueueLink } = require('./crawler/enqueueLink')
const { saveData } = require('./crawler/utillty')
const { puppeteerCrawler } = require('./crawler/puppeteerCrawler')
const { requestQueue } = require('./crawler/requestQueue')
module.exports = {
    requestQueue,
    puppeteerCrawler,
    enqueueLink, 
    saveData
}