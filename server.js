/*server.js*/

const http = require('http');
const fs = require('fs');

const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const server = http.createServer(function(req, res) {
  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
       res.writeHead(404);
       res.end(JSON.stringify(err));
       return;
    }
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(port, hostname, function() {
  console.log('Server running at http://'+ hostname + ':' + port + '/');
});
