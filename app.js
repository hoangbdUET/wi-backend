/**
 * Created by minhtan on 20/06/2017.
 */
var express = require('express');
var app = express();
var project = require('./server/project/project.router');
app.use('/',project);
app.get('/', function (req, res) {
    res.send("WELCOME TO WI-SYSTEM");
});


app.listen(3000,function () {
    console.log("Listening on port 3000! Waiting for connections ...");
});
