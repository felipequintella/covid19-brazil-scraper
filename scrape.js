const puppeteer = require('puppeteer')

let scrape = async () => {
//  const browser = await puppeteer.launch({executablePath: 'chrome.exe', headless: false})
  const browser = await puppeteer.launch({args: ['--no-sandbox']})
  const page = await browser.newPage()

  await Promise.all([
    page.goto('https://covid.saude.gov.br/'),  
    page.waitForNavigation({
      waitUntil: 'networkidle0',
    }),
  ]);

  page.setRequestInterception(true);

  const result = await page.evaluate(() => {
    document.querySelector('div.ok').click()
   })

  page.on('request', request => {
    if (request.resourceType() === 'text/csv' || request.resourceType() === 'document') {
       console.log(request.url());
       const url = request.url();
       request.abort();

       const https = require('https');
       const fs = require('fs');

       const file = fs.createWriteStream("brazil.csv");
       const requesting = https.get(url, function(response) {
         response.pipe(file);
       });
    } else {
       request.continue();
    }
  });
  browser.close();


};


scrape();

