/**
 * Created by minhtan on 20/06/2017.
 */
var express = require('express');
var app = express();
var morgan = require('morgan');
var path = require('path');
var fs = require('fs');
const cors = require('cors');
var config=require('config').Application;

var projectRouter = require('./server/project/project.router');
var wellRouter = require('./server/well/well.router');
var plotRouter = require('./server/plot/plot.router');
var curveRouter = require('./server/curve/curve.router');
var trackRouter = require('./server/track/track.router');
var depthAxisRouter = require('./server/depth-axis/depth-axis.router');
var uploadRouter = require('./server/upload/index');
var datasetRouter = require('./server/dataset/dataset.router');
var lineRouter = require('./server/line/line.router');
var shadingRouter = require('./server/shading/shading.router');

var http = require('http').Server(app);

var io = require('socket.io')(http);
io.on('connection', function (socket) {
    console.log('Connecting');
});//TODO

lineRouter.registerHooks(io);
projectRouter.registerHooks(io);

app.use(cors());
/**
   Attach all routers to app
 */
app.use('/', uploadRouter);
app.use('/', projectRouter);
app.use('/project', wellRouter);
app.use('/project/well', plotRouter);
app.use('/project/well',datasetRouter);
app.use('/project/well/dataset', curveRouter);//change
app.use('/project/well/plot', depthAxisRouter);
app.use('/project/well/plot', trackRouter);
app.use('/project/well/plot/track', lineRouter);
app.use('/project/well/plot/track', shadingRouter);


/**
 * Log manager
 */
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));


app.get('/', function (req, res) {
    res.send("WELCOME TO WI-SYSTEM");
});

/*
*   Two rows beneath just run FamilyUpdater and FamilyCondition Updater
* */
require('./server/family/FamilyUpdater');
require('./server/family/FamilyConditionUpdater');

http.listen(config.port,function () {
    console.log("Listening on port "+config.port);
});
