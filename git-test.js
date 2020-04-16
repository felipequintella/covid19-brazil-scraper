let scrape = async () => {
       const USER = process.env.GIT_USER;
       const PASS = process.env.GIT_PASS;
       const REPO = 'github.com/felipequintella/covid19-brazil-scraper';
       const remote = `https://${USER}:${PASS}@${REPO}`;
       
       const simpleGit = require('simple-git/promise');
       const git = simpleGit();
       console.log("getting in")
       if (git.checkIsRepo() === false) {
           console.log("in");
//         await git.clone(remote, "./tmp-repo/", ["--no-checkout"]);
//         await git.mv("./tmp-repo/.git", "./");
//         await git.reset("--hard", "HEAD")
       }
       console.log("out")
       
//       git.add('./brazil.csv')
//       git.commit('updating data')
//       git.removeRemote('origin')
//       git.addRemote('origin', remote)
//       await git.push('origin', 'master');

}

scrape();

