require('dotenv').config()
const { saveData } = require('../crawler/utillty')


const { enqueueLink } = require('../crawler/enqueueLink')
const { requestQueue } = require('../crawler/requestQueue')

async function extractPageData(props) {
  const { page } = props
  const url = await page.url()
  const book = await page.evaluate(() => {
    const productDescription = document.querySelector('article.product_page > p').innerHTML
    const category = Array.from(document.querySelector('.breadcrumb').querySelectorAll('li a'))[2].innerHTML.trim()
    const UPS = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(1) > td').innerHTML
    const ProductType = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(2) > td').innerHTML
    const PriceTaxExcluded = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(3) > td').innerHTML
    const PriceTaxIncluded = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(4) > td').innerHTML
    const Tax = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(5) > td').innerHTML
    const Availability = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(6) > td').innerHTML
    const Reviews = document.querySelector('#content_inner > article > table > tbody > tr:nth-child(7) > td').innerHTML
    const imageURL = document.querySelector('#product_gallery > div > div > div > img').src

    return { productDescription, category, UPS, ProductType, PriceTaxExcluded, PriceTaxIncluded, Tax, Availability, Reviews, images: [imageURL] }
  })
  return { ...book, url };

}


async function handlePageFunction(props) {
  const { page, userData} = props

  await page.waitForSelector('.default')
  const { output } = userData
  const url = await page.url()
  const sideBar = await page.$('.sidebar')

  if (!url.includes('page-') && sideBar) {

    const hasPagination = await page.$('.pager')
    if (hasPagination) {

      const totalPages = await page.evaluate(() => {
        const pager = Array.from(document.querySelector('.pager').querySelectorAll('li')).filter(f => f.classList.contains('current')).map(m => m.textContent.trim())
        return parseInt(pager[0].substring(pager[0].indexOf('of') + 2).trim())
      })

      for (let i = 2; i <= totalPages; i++) {
        const nextPageUrl = `https://books.toscrape.com/catalogue/category/books_1/page-${i}.html`
        requestQueue.push({ ...props, url: nextPageUrl })
      }

    }

  }

  if (sideBar) {

    await enqueueLink({ selector: '.image_container a', ...props })

  }

  const productDetailImageContainer = await page.$('#product_description')

  if (productDetailImageContainer) {
debugger;
    const product = await extractPageData(props)

    saveData({ data: product, output, filename: 'books.json' })

  }

}












module.exports = {

  handlePageFunction
}





