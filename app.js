/**
 * Created by minhtan on 20/06/2017.
 */
var familyUpdate = require('./server/family/GlobalFamilyUpdater');
var familyConditionUpdate = require('./server/family/GlobalFamilyConditionUpdater');
var overlayLineUpdate = require('./server/overlay-line/overlay-line.update');
var models = require("./server/models-master");
familyUpdate(function () {
    familyConditionUpdate(function () {
        overlayLineUpdate(function () {
            main();
        });
    });
})

//main();

function main() {
    var express = require('express');
    var app = express();
    var morgan = require('morgan');
    var path = require('path');
    var fs = require('fs');
    const cors = require('cors');
    var fullConfig = require('config');
    var config = fullConfig.Application;

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
    var imageRouter = require('./server/image/image.router');
    var crossPlotRouter = require('./server/cross-plot/cross-plot.router');
    var pointSetRouter = require('./server/pointset/pointset.router');
    var polygonRouter = require('./server/polygon/polygon.router');
    var discrimRouter = require('./server/discrim/discrim.router');
    var histogramRouter = require('./server/histogram/histogram.router');
    var palRouter = require('./server/pal/index');
    var customFillRouter = require('./server/custom-fill/index');
    var userDefineLineRouter = require('./server/line-user-define/user-line.router');
    var annotationRouter = require('./server/annotation/annotation.router');
    var regressionLineRouter = require('./server/regression-line/regression-line.route');
    var familyRouter = require('./server/family/family.router');
    var globalFamilyRouter = require('./server/family/global.family.router');
    var referenceCurveRouter = require('./server/reference-curve/reference-curve.router');
    var ternaryRouter = require('./server/ternary/ternary.router');
    var inventoryRouter = require('./server/import-from-inventory/index');
    var imageTrackRouter = require('./server/image-track/image-track.router');
    var imageOfTrackRouter = require('./server/image-of-track/image-of-track.router');
    var objectTrackRouter = require('./server/object-track/object-track.router');
    var objectOfTrackRouter = require('./server/object-of-track/object-of-track.router');
    var databaseRouter = require('./server/database/index');
    var overlayLineRouter = require('./server/overlay-line/overlay-line.router');
    var groupsRouter = require('./server/groups/groups.router');
    var axisColorRouter = require('./server/cross-plot/axis-color-template/index');

    var http = require('http').Server(app);
    app.use(cors());
    /**
     Attach all routers to app
     */

    app.use(express.static(path.join(__dirname, '/server/plot/plot-template/')));
    app.use(express.static(path.join(__dirname, fullConfig.imageBasePath)));
    app.use('/', globalFamilyRouter);
    app.get('/', function (req, res) {
        res.send("WELCOME TO WI-SYSTEM");
    });
    app.use('/', databaseRouter);
    var authenticate = require('./server/authenticate/authenticate');
    app.use(authenticate());
    app.use('/', inventoryRouter);
    app.use('/', uploadRouter);
    app.use('/', projectRouter);
    app.use('/', familyRouter);
    app.use('/', imageUpload);
    app.use('/pal', palRouter);
    app.use('/custom-fill', customFillRouter);
    app.use('/project', wellRouter);
    app.use('/project', groupsRouter);
    app.use('/project/well', plotRouter);
    app.use('/project/well', datasetRouter);
    app.use('/project/well', zoneSetRouter);
    app.use('/project/well', histogramRouter);
    app.use('/project/well', crossPlotRouter);
    app.use('/project/well', referenceCurveRouter);
    app.use('/project/well/plot', imageTrackRouter);
    app.use('/project/well/plot', depthAxisRouter);
    app.use('/project/well/plot', trackRouter);
    app.use('/project/well/plot', zoneTrackRouter);
    app.use('/project/well/plot', objectTrackRouter);
    app.use('/project/well/plot/track', markerRouter);
    app.use('/project/well/plot/track', shadingRouter);
    app.use('/project/well/plot/track', lineRouter);
    app.use('/project/well/plot/track', imageRouter);
    app.use('/project/well/plot/track', annotationRouter);
    app.use('/project/well/dataset', curveRouter);//change
    app.use('/project/well/zone-set', zoneRouter);
    app.use('/project/well/cross-plot', polygonRouter);
    app.use('/project/well/cross-plot', pointSetRouter);
    app.use('/project/well/cross-plot', userDefineLineRouter);
    app.use('/project/well/cross-plot', ternaryRouter);
    app.use('/project/well/cross-plot', regressionLineRouter);
    app.use('/project/well/cross-plot', overlayLineRouter);
    app.use('/project/well/cross-plot', axisColorRouter);
    app.use('/project/well/plot/object-track', objectOfTrackRouter);
    app.use('/project/well/plot/image-track', imageOfTrackRouter);

    /**
     * Log manager
     */
        // create a write stream (in append mode)
    var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
    app.use(morgan('combined', {stream: accessLogStream}));

    http.listen(config.port, function () {
        console.log("Listening on port " + config.port);
    });
}
