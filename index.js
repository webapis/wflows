
const { enqueueLink } = require('./crawler/enqueueLink')
const { saveData } = require('./crawler/utillty')
const { puppeteerCrawler } = require('./crawler/puppeteerCrawler')
const { requestQueue } = require('./crawler/requestQueue')
const { fbRest, renewIdToken } = require('./firebase/firebase-rest')
module.exports = {
    requestQueue,
    puppeteerCrawler,
    enqueueLink,
    saveData,
    firebase: { fbRest, renewIdToken }
}