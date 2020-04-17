const puppeteer = require('puppeteer');
const mv = require('mv');

let scrape = async () => {
//  const browser = await puppeteer.launch({executablePath: 'chrome.exe', headless: false})
  const browser = await puppeteer.launch({args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-first-run', '--no-sandbox', '--no-zygote', '--single-process', ]})

  const page = await browser.newPage()

  await Promise.all([
    page.goto('https://covid.saude.gov.br/'),  
    page.waitForNavigation({
      waitUntil: 'networkidle0',
    }),
  ]);

  await page.screenshot({path: 'screen.png'});

  page.setRequestInterception(true);

  const result = await page.evaluate(() => {
    document.querySelector('body > app-root > ion-app > ion-router-outlet > app-home > ion-content > div.content-top.display-flex.justify-between > div.card-total.col-right.no-shadow.display-flex.justify-end > ion-button').click()
   })

   page.on('request', async request => {
    console.log("Requesting " + request.url());

    if (request.resourceType() === 'text/csv' || request.resourceType() === 'document') {
       console.log(request.url());
       const url = request.url();
       request.abort();

       await download(url);
       console.log("Saved file");
       change = true;

       const USER = process.env.GIT_USER;
       const PASS = process.env.GIT_PASS;
       const REPO = 'github.com/felipequintella/covid19-brazil-scraper';
       const remote = `https://${USER}:${PASS}@${REPO}`;
       console.log("Pushing");
       const simpleGit = require('simple-git/promise');
       const git = simpleGit();

       const isRepo = await git.checkIsRepo();

       if (isRepo === false) {
         console.log("Initiating git repo");
         await git.clone(remote, "./tmp-repo/", ["--no-checkout"]);
         console.log("cloned");
         await mv('./tmp-repo/.git', '.git', {mkdirp:true}, function(err) {});
         console.log("moved");
         await git.reset("--hard", "HEAD");
         console.log("reset");
       }

       await git.addConfig('user.name', 'felipequintella');
       await git.addConfig('user.email', 'felipequintella86@gmail.com');
       console.log("config done");
       await git.add('.')
       console.log("added");
       await git.commit('updating data')
       await git.removeRemote('origin')
       await git.addRemote('origin', remote)
       await git.push('origin', 'master');

       browser.close();
    } else {
       request.continue();
    }
  });

};

let download = async (url) => {
     const https = require('https');
     const fs = require('fs');

     const download = fs.createWriteStream("brazil.csv");
     await new Promise((resolve, reject)=> {
        https.get(url, function(response) {
          response.pipe(download);
        });
        download.on("close", resolve);
        download.on("error", console.error);
     });
     console.log("End of download");
}

scrape();

