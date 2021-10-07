const scraperObject = {
    url: 'https://www.avito.ru/sankt-peterburg/koshki/poroda-meyn-kun-ASgBAgICAUSoA5IV',
    async scraper(browser){
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url);
        let scrapedData = [];

        // Ждем пока рендерится DOM
        await page.waitForSelector('.index-inner-dqBR5');

        // Получаем ссылкы на все товары
        let urls = await page.$$eval('.iva-item-content-UnQQ4', links => {
            links = links.map(el => el.querySelector('div > a').href)
            return links;
        });

        // Форматируем дату создания обьявления
        const dateFormat = (date) => {
            date = date.split(' ')
            let today = new Date()
                    let year = today.getFullYear();
                    let month = today.getMonth()
                    let day = today.getDate()
                    const months = {
                    'января' : '01',
                    'февраля' : '02',
                    'марта' : '03',
                    'апреля' : '04',
                    'мая' : '05',
                    'июня' : '06',
                    'июля' : '07',
                    'августа' : '08',
                    'сентября' : '09',
                    'октября' : '10',
                    'ноября' : '11',
                    'декабря' : '11',
                    }
                    if (date.length == 9){
                        date = year + '-' + months[date[4]] + '-' + date[3]
                    } else{
                        date = year + '-' + month + '-' + day
                    }
                    return date
        };

        // Открываем каждую ссылку в новой вкладке и получаем нужные данные
        let pagePromise = (link) => new Promise(async(resolve, reject) => {
                
            let dataObj = {};
            let newPage = await browser.newPage();
            await newPage.goto(link, {waitUntil: 'load', timeout: 0});

            let titleCheck = await newPage.$('.title-info-title');
            let authorCheck = await newPage.$('.seller-info-name');
            let companyCheck = await newPage.$('.link-link-39EVK');
            let descriptionCheck = await newPage.$('.item-description > div');
            let dateCheck = await newPage.$('.title-info-metadata-item-redesign');
                
            // Если какого-то из этих элементов нет, то перезагружаем страницу
            if (!titleCheck || !authorCheck  || !companyCheck || !descriptionCheck || !dateCheck){
                await newPage.goto(link, {waitUntil: 'load', timeout: 0})
            }

            dataObj['title'] = await newPage.$eval('.title-info-title > span', text => text.textContent);
            dataObj['description'] = await newPage.$eval('.item-description > div', text => {
                return text.textContent.split('\n')[1].trim()
            });
            dataObj['url'] = link;
            dataObj['price'] = await newPage.$eval('.price-value-string', text => {
                text = parseInt(text.textContent.replace(/\D+/g, ''));
                if (isNaN(text)){
                    text = 0
                }
                return text
            })

            if (companyCheck) {
                dataObj['author'] = await newPage.$eval('.link-link-39EVK', text => text.textContent)
            } else if (authorCheck) {
                dataObj['author'] = await newPage.$eval('.seller-info-name', text => text.textContent.split('\n')[2].trim())
            }
            
            let dateUnformatted = await newPage.$eval('.title-info-metadata-item-redesign', text => text.textContent)
            dataObj['date'] = dateFormat(dateUnformatted)
            dataObj['phone'] = await newPage.$eval('.text-text-1PdBw', text => text.textContent)
            resolve(dataObj);
            await newPage.close();
        });

        // Записываем считанные данные в scrapedData
        for(link in urls){
            let currentPageData = await pagePromise(urls[link]);
            scrapedData.push(currentPageData);
            console.log(currentPageData);
        }
    
        await page.close();
        return scrapedData;
    }
}

module.exports = scraperObject;