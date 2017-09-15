/**
 * Created by minhtan on 20/06/2017.
 */
var familyUpdate = require('./server/family/FamilyUpdater');
var familyConditionUpdate = require('./server/family/FamilyConditionUpdater');

familyUpdate(function () {
    familyConditionUpdate(function () {
        main();
    });
});

function main() {
    var express = require('express');
    var app = express();
    var morgan = require('morgan');
    var path = require('path');
    var fs = require('fs');
    const cors = require('cors');
    var fullConfig = require('config');
    var config = fullConfig.Application;

    var authenRouter = require('./server/authenticate/authenticate.router');
    var projectRouter = require('./server/project/project.router');
    var wellRouter = require('./server/well/well.router');
    var plotRouter = require('./server/plot/plot.router');
    var markerRouter = require('./server/marker/marker.router');
    var curveRouter = require('./server/curve/curve.router');
    var trackRouter = require('./server/track/track.router');
    var depthAxisRouter = require('./server/depth-axis/depth-axis.router');
    var uploadRouter = require('./server/upload/index');
    var datasetRouter = require('./server/dataset/dataset.router');
    var lineRouter = require('./server/line/line.router');
    var shadingRouter = require('./server/shading/shading.router');
    var zoneTrackRouter = require('./server/zone-track/zone-track.router');
    var zoneSetRouter = require('./server/zone-set/zone-set.router');
    var zoneRouter = require('./server/zone/zone.router');
    var imageUpload = require('./server/image-upload');
    var crossPlotRouter = require('./server/cross-plot/cross-plot.router');
    var pointSetRouter = require('./server/pointset/pointset.router');
    var polygonRouter = require('./server/polygon/polygon.router');
    var discrimRouter = require('./server/discrim/discrim.router');
    var histogramRouter = require('./server/histogram/histogram.router');
    var palRouter = require('./server/pal/index');
    var customFillRouter = require('./server/custom-fill/index');
    var userDefineLineRouter = require('./server/line-user-define/user-line.router');

    var http = require('http').Server(app);

    /*
    var io = require('socket.io')(http);
    io.on('connection', function (socket) {
        console.log('Connecting');
    });

    lineRouter.registerHooks(io);
    projectRouter.registerHooks(io);
    */
    app.use(cors());
    /**
     Attach all routers to app
     */

    app.use('/', authenRouter);
    var authenticate = require('./server/authenticate/authenticate');
    app.use('/', uploadRouter);
    app.use('/', projectRouter);
    //app.use(authenticate());
    app.use('/pal', palRouter);
    app.use('/custom-fill', customFillRouter);
    app.use('/project', wellRouter);
    app.use('/project/well', plotRouter);
    app.use('/project/well', datasetRouter);
    app.use('/project/well/dataset', curveRouter);//change
    app.use('/project/well/plot', depthAxisRouter);
    app.use('/project/well/plot', trackRouter);
    app.use('/project/well/plot/track', lineRouter);
    app.use('/project/well/plot/track', shadingRouter);
    app.use('/project/well/plot', zoneTrackRouter);
    app.use('/project/well/plot/track', markerRouter);
    app.use('/project/well', zoneSetRouter);
    app.use('/project/well/zone-set/', zoneRouter);
    app.use('/project/well', crossPlotRouter);
    app.use('/project/well/cross-plot', polygonRouter);
    app.use('/project/well/cross-plot', pointSetRouter);
    app.use('/project/well/cross-plot', userDefineLineRouter);
    app.use('/project/well/', discrimRouter);
    app.use('/project/well/', histogramRouter);
    app.use('/', imageUpload);
    app.use(express.static(path.join(__dirname, fullConfig.imageBasePath)));


    /**
     * Log manager
     */
        // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
    app.use(morgan('combined', {stream: accessLogStream}));


    app.get('/', function (req, res) {
        res.send("WELCOME TO WI-SYSTEM");
    });
    http.listen(config.port, function () {
        console.log("Listening on port " + config.port);
    });
}
