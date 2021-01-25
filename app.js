var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");

const PORT=8080;

fs.readFile('./index.html', function (err, html){
    if (err) throw err;

    http.createServer(function(request, response){
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(PORT);
});