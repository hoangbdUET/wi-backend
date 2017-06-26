/**
 * Created by minhtan on 20/06/2017.
 */
var express = require('express');
var app = express();
var projectRouter = require('./server/project/project.router');
var wellRouter = require('./server/well/well.router');
var plotRouter = require('./server/plot/plot.router');
var curveRouter = require('./server/curve/curve.router');
var trackRouter = require('./server/track/track.router');
var depthAxisRouter = require('./server/depth-axis/depth-axis.router');

app.use('/',projectRouter);
app.use('/project', wellRouter);
app.use('/project/well',plotRouter);
app.use('/project/well', curveRouter);
app.use('/project/well/plot', depthAxisRouter);
app.use('/project/well/plot', trackRouter);



app.get('/', function (req, res) {
    res.send("WELCOME TO WI-SYSTEM");
});


app.listen(3000,function () {
    console.log("Listening on port 3000!");
});
