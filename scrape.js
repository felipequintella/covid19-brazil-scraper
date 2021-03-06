const puppeteer = require('puppeteer');
const mv = require('mv');
const fs = require('fs');
const XLSX = require('xlsx');

let scrape = async () => {
//  const browser = await puppeteer.launch({executablePath: 'chrome.exe', headless: false})
  const browser = await puppeteer.launch({args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-first-run', '--no-sandbox', '--no-zygote', '--single-process', ]})

  const page = await browser.newPage()

  await  page.setRequestInterception(true);

  page.on('request', async request => {
    console.log("Requesting " + request.url());

    if (request.url().includes('.xlsx')) { //resourceType() === 'text/csv' ) { //|| request.resourceType() === 'document') {
       console.log(request.url());
       const url = request.url();
       await request.abort();

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
        await timeout(15000); 
        console.log("cloned");
         await mv('./tmp-repo/.git', '.git', {mkdirp:true}, function(err) {});
         await timeout(15000);
         console.log("moved");
         await git.reset('hard');
         await timeout(15000);
         console.log("reset");
       }

       fs.unlinkSync("./brazil.xlsx");
       await download(url);
       console.log("Saved file")

       await convert("brazil.xlsx")

       await git.addConfig('user.name', 'felipequintella');
       await git.addConfig('user.email', 'felipequintella86@gmail.com');
       console.log("config done");
       await git.add('./brazil.xlsx')
       await git.add('./brazil.csv')
       await git.add('./.gitignore')
       await git.add('LICENSE')
       await git.add('README.md')
       await git.add('git-test.js')
       await git.add('package.json')
       await git.add('scrape.js')
       await git.add('screen.png')
       await git.add('server.js')
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

  await Promise.all([
    page.goto('https://covid.saude.gov.br/'),  
    page.waitForNavigation({
      waitUntil: 'networkidle0',
    }),
  ]);

  await timeout(15000);

  await page.screenshot({path: 'screen.png'});


  page.evaluate(() => {
      document.querySelector('body > app-root > ion-app > ion-router-outlet > app-home > ion-content > div.max-width-full.content-top.display-flex.justify-between > div.card-total.col-right.no-shadow.display-flex.justify-end > ion-button > ion-icon').click();
   })
//  page.click('body > app-root > ion-app > ion-router-outlet > app-home > ion-content > div.content-top.display-flex.justify-between > div.card-total.col-right.no-shadow.display-flex.justify-end > ion-button > ion-icon');




};

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let download = async (url) => {
     const https = require('https');

     const download = fs.createWriteStream("brazil.xlsx");
     await new Promise((resolve, reject)=> {
        https.get(url, function(response) {
          response.pipe(download);
        });
        download.on("close", resolve);
        download.on("error", console.error);
     });
     console.log("End of download");
}

let convert = async(file) => {
    console.log("Start of conversion");
    fs.readFile(file, function (err, data) {
        if (err) throw err;
        console.log("Buffer read")
        /* Call XLSX */
        var workbook = XLSX.read(data);
        console.log("File read");
        var stream = XLSX.stream.to_csv(worksheet);
        console.log("Stream created");
        stream.pipe(fs.createWriteStream('brazil.csv'));
        console.log("Stream finalized");
        //XLSX.writeFile(workbook, 'brazil.csv');
        console.log("End of conversion");
    });
    
}

scrape();

