const mv = require('mv');

let scrape = async () => {
       const USER = process.env.GIT_USER;
       const PASS = process.env.GIT_PASS;
       const REPO = 'github.com/felipequintella/covid19-brazil-scraper';
       const remote = `https://${USER}:${PASS}@${REPO}`;
       
       const simpleGit = require('simple-git/promise');
       const git = simpleGit();

       const result = await git.checkIsRepo();

	console.log(result);

       console.log("getting in")
       if (result === false) {
           console.log("inside false");
         await git.clone(remote, "./tmp-repo/", ["--no-checkout"]);
         console.log("cloned");
//         await git.mv("tmp-repo/.git", ".");
         mv('./tmp-repo/.git', '.', {mkdirp: true}, funtion(err) {}));
         console.log("moved");
         await git.reset("--hard", "HEAD")
         console.log("reset");
       } else if (result === true) {
         console.log("inside true")
       }
       console.log("out")
       
//       git.add('./brazil.csv')
//       git.commit('updating data')
//       git.removeRemote('origin')
//       git.addRemote('origin', remote)
//       await git.push('origin', 'master');

}

scrape();

