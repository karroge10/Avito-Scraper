const pageScraper = require('./pageScrapper');
const fs = require('fs')
async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = {};
        scrapedData = await pageScraper.scraper(browser);
        await browser.close();
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Скрейпинг обьявлений завершен. Данные записаны в файл './data.json'");
        });
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)