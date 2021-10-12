
const { promiseEventTypes } = require('../promise-concurrency')

async function pageController(props) {

  const { handlePageFunction, browser, url } = props



  const eventEmitter = global.puppeteer_eventEmitter;
  const page = await browser.newPage();

  try {

    await page.setRequestInterception(true);
    page.on('request', req => {
      const resourceType = req.resourceType();
      if (resourceType === 'image') {
        req.respond({
          status: 200,
          contentType: 'image/jpeg',
          body: ''
        });

      } else {
        req.continue();
      }
    });

    //    const timeout = retries === 0 ? 30000 : retries * 30000
    // process.env.LOCAL === 'TRUE' ? await page.goto(url, { waitUntil: 'networkidle2', timeout }) : await page.goto(url);
    //  postNavHook && await postNavHook({ page })
    
    await page.goto(url)
    await handlePageFunction({ ...props, page })

    await page.close()

    eventEmitter.emit(promiseEventTypes.PROMISE_RESOLVED, props)


  } catch (error) {

    const { name } = error

    if (name === 'TimeoutError') {
  
      await page.close()
      eventEmitter.emit(promiseEventTypes.PROMISE_REJECTED, { ...props, error })
    } else {
      debugger;
      console.log("pageController ERROR.....:", error)
      //recordError({ batchName, error: { error, url }, functionName: 'pageController', dirName: 'page-collection-errors' })
    }
  }

}




module.exports = { pageController };
