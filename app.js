/**
 * Created by minhtan on 20/06/2017.
 */
let overlayLineUpdate = require('./server/overlay-line/overlay-line.update');
let workflowSpecUpdate = require('./server/workflow-spec/workflow-spec.update');
let taskSpecUpdate = require('./server/task/task-spec').createTaskSpec;
let zoneTemplateUpdate = require('./server/zone-template/zone-template.model').createZoneTemplateFromXLSX;
const QUEUE_TIME = 500;

Object.defineProperty(Array.prototype, "forEachDone", {
    enumerable: false,
    value: function (task, cb) {
        let obj = this;
        let counter = 0;
        Object.keys(obj).forEach(function (key, index, array) {
            task(obj[key], key, obj);
            if (array.length === ++counter) {
                if (cb) cb();
            }
        });
    }
});
setTimeout(function () {
    main();
    let familySystemSync = require('./server/family/FamilySystemSync');
    familySystemSync(function () {
        overlayLineUpdate(function () {

        });
        workflowSpecUpdate(function () {

        });
        taskSpecUpdate(function () {

        });
        zoneTemplateUpdate(function () {

        });
    });
}, 1000);

function main() {
    let authenticate;
    let accessLogStream;
    let express = require('express');
    let app = express();
    let morgan = require('morgan');
    let path = require('path');
    let fs = require('fs');
    const cors = require('cors');
    let fullConfig = require('config');
    let config = fullConfig.Application;
    require('./server/utils/redis');
    let projectRouter = require('./server/project/project.router');
    let wellRouter = require('./server/well/well.router');
    let plotRouter = require('./server/plot/plot.router');
    let markerRouter = require('./server/marker/marker.router');
    let curveRouter = require('./server/curve/curve.router');
    let trackRouter = require('./server/track/track.router');
    let depthAxisRouter = require('./server/depth-axis/depth-axis.router');
    let uploadRouter = require('./server/upload/index');
    let datasetRouter = require('./server/dataset/dataset.router');
    let lineRouter = require('./server/line/line.router');
    let shadingRouter = require('./server/shading/shading.router');
    let zoneTrackRouter = require('./server/zone-track/zone-track.router');
    let zoneSetRouter = require('./server/zone-set/zone-set.router');
    let zoneRouter = require('./server/zone/zone.router');
    let imageUpload = require('./server/image-upload');
    let imageRouter = require('./server/image/image.router');
    let crossPlotRouter = require('./server/cross-plot/cross-plot.router');
    let pointSetRouter = require('./server/pointset/pointset.router');
    let polygonRouter = require('./server/polygon/polygon.router');
    let workflowRouter = require('./server/workflow/workflow.router');
    let workflowSpecRouter = require('./server/workflow-spec/workflow-spec.router');

    let histogramRouter = require('./server/histogram/histogram.router');
    let palRouter = require('./server/pal/index');
    let customFillRouter = require('./server/custom-fill/index');
    let userDefineLineRouter = require('./server/line-user-define/user-line.router');
    let annotationRouter = require('./server/annotation/annotation.router');
    let regressionLineRouter = require('./server/regression-line/regression-line.route');
    let familyRouter = require('./server/family/family.router');
    let familyUnitRouter = require('./server/family-unit/family-unit.router');
    let globalFamilyRouter = require('./server/family/global.family.router');
    let referenceCurveRouter = require('./server/reference-curve/reference-curve.router');
    let ternaryRouter = require('./server/ternary/ternary.router');
    let inventoryRouter = require('./server/import-from-inventory/index');
    let imageTrackRouter = require('./server/image-track/image-track.router');
    let imageOfTrackRouter = require('./server/image-of-track/image-of-track.router');
    let objectTrackRouter = require('./server/object-track/object-track.router');
    let objectOfTrackRouter = require('./server/object-of-track/object-of-track.router');
    let databaseRouter = require('./server/database/index');
    let overlayLineRouter = require('./server/overlay-line/overlay-line.router');
    let groupsRouter = require('./server/groups/groups.router');
    let axisColorRouter = require('./server/cross-plot/axis-color-template/index');
    let dustbinRouter = require('./server/dustbin/dustbin.router');
    let selectionToolRouter = require('./server/selection-tool/selection-tool.router');
    let testRouter = require('./test.js');
    let combinedBoxToolRouter = require('./server/combined-box-tool/combined-box-tool.router');
    let combinedBoxRouter = require('./server/combined-box/combined-box.router');
    let asyncQueue = require('async/queue');
    let zoneTemplateRouter = require('./server/zone-template/zone-template.router');
    let patternRouter = require('./server/pattern/pattern.router');
    let flowRouter = require('./server/flow/flow.router');
    let taskRouter = require('./server/task/task.router');
    let taskSpecRouter = require('./server/task/task-spec.router');
    // let exportRouter = require('./server/export/export');
    let parameterSetRouter = require('./server/parameter-set/parameter-set.router');
    let queue = {};
    let http = require('http').Server(app);
    app.use(cors());
    // app.use(queue({activeLimit: 2, queuedLimit: 2}));
    /**
     Attach all routers to app
     */

    app.use(express.static(path.join(__dirname, fullConfig.imageBasePath)));
    app.use('/pattern', express.static(path.join(__dirname, '/server/pattern/files')));
    app.use('/', globalFamilyRouter);
    app.use(fullConfig.exportUrl, express.static(path.join(__dirname, 'server/exports')));  
    app.get('/', function (req, res) {
        res.send("WELCOME TO WI-SYSTEM");
    });
    app.use('/', databaseRouter);
    authenticate = require('./server/authenticate/authenticate');
    app.use('/', testRouter);
    app.use(authenticate());
    app.use('/project', parameterSetRouter);
    app.use('/', patternRouter);
    app.use('/', inventoryRouter);
    app.use('/', uploadRouter);
    app.use('/', projectRouter);
    app.use('/', familyRouter);
    app.use('/', familyUnitRouter);
    app.use('/', imageUpload);
    app.use('/', dustbinRouter);
    app.use('/', workflowRouter);
    app.use('/', workflowSpecRouter);
    app.use('/', zoneTemplateRouter);
    app.use('/', taskSpecRouter);
    app.use('/pal', palRouter);
    app.use('/custom-fill', customFillRouter);
    app.use('/project', wellRouter);
    app.use('/project', groupsRouter);
    app.use('/project', plotRouter);
    app.use('/project/well', datasetRouter);
    app.use('/project/well', zoneSetRouter);
    app.use('/project', histogramRouter);
    app.use('/project', crossPlotRouter);
    app.use('/project/well', referenceCurveRouter);
    app.use('/project/well', combinedBoxRouter);
    app.use('/project', flowRouter);
    app.use('/project/flow', taskRouter);
    //middleware for all curve router to block spam request
    app.use('/project/well/dataset/curve', function (req, res, next) {
        if (!queue[req.decoded.username]) {
            queue[req.decoded.username] = asyncQueue(function (next, cb) {
                setTimeout(function () {
                    next();
                    cb();
                }, QUEUE_TIME);
            }, 6);
        }
        queue[req.decoded.username].push(next, function () {
            // console.log("Push to queue");
        });
    });
    app.use('/project/well/combined-box', selectionToolRouter);
    app.use('/project/well/combined-box', combinedBoxToolRouter);
    app.use('/project/plot', imageTrackRouter);
    app.use('/project/plot', depthAxisRouter);
    app.use('/project/plot', trackRouter);
    app.use('/project/plot', zoneTrackRouter);
    app.use('/project/plot', objectTrackRouter);
    app.use('/project/plot/track', markerRouter);
    app.use('/project/plot/track', shadingRouter);
    app.use('/project/plot/track', lineRouter);
    app.use('/project/plot/track', imageRouter);
    app.use('/project/plot/track', annotationRouter);
    app.use('/project/well/dataset', curveRouter);//change
    app.use('/project/well/zone-set', zoneRouter);
    app.use('/project/cross-plot', polygonRouter);
    app.use('/project/cross-plot', pointSetRouter);
    app.use('/project/cross-plot', userDefineLineRouter);
    app.use('/project/cross-plot', ternaryRouter);
    app.use('/project/cross-plot', regressionLineRouter);
    app.use('/project/cross-plot', overlayLineRouter);
    app.use('/project/cross-plot', axisColorRouter);
    app.use('/project/plot/object-track', objectOfTrackRouter);
    app.use('/project/plot/image-track', imageOfTrackRouter);
    // app.use('/export', exportRouter);

    accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
    app.use(morgan('combined', {stream: accessLogStream}));

    http.listen(config.port, function () {
        console.log("Listening on port " + config.port);
    });
}
