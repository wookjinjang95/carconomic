var path = require('path');
var express = require('express');
var app = express();

var dir = __dirname;

app.use(express.static(dir));
console.log(dir)

app.listen(8080, () => console.log('Listening on http://localhost:8080/'));

var fs = require('fs');
const files = fs.readdirSync('data_scraper/tesla/');
console.log(files);