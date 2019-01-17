var asyncLoop = require('node-async-loop');
var hashDir = require('../utils/data-tool').hashDir;
var fs = require('fs');
var importer = require('./index');
var config = require('config');
console.log(config);
importer.syncDataFromInventory("D:/tmp2/04c12ad6/2ac53f96/ca63f4fd/0b37aa68/DTCO3.txt", "hoang", function () {

});