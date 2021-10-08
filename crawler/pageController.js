
const {promiseEventTypes}=require('../promise-concurrency')

async function pageController({ handlePageFunction, preNavHook, postNavHook, props, batchName, uuid ,browser,unshift,sync   }) {
  const {url,userData}= props

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
      process.env.LOCAL ==='TRUE'? await page.goto(url, { waitUntil: 'networkidle2', timeout }):   await page.goto(url);
    //  postNavHook && await postNavHook({ page })
debugger;
      await handlePageFunction({
        page,
        userData,
        batchName, unshift ,sync
      })

      await page.close()

      eventEmitter.emit(promiseEventTypes.PROMISE_RESOLVED,{ batchName, props, uuid })


    } catch (error) {

      const { name } = error
      debugger;
      if (name === 'TimeoutError') {
        eventEmitter.emit(promiseEventTypes.PROMISE_REJECTED,{batchName, props, unshift, uuid, error })
        await page.close()
      } else {
        debugger;
        console.log("pageController ERROR.....:", error)
        //recordError({ batchName, error: { error, url }, functionName: 'pageController', dirName: 'page-collection-errors' })
      }
    }
  
}




module.exports = { pageController };
