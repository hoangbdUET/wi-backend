/**
 * Created by minhtan on 20/06/2017.
 */
let overlayLineUpdate = require('./server/overlay-line/overlay-line.update');
let workflowSpecUpdate = require('./server/workflow-spec/workflow-spec.update');
let taskSpecUpdate = require('./server/task/task-spec').createTaskSpec;
let zoneTemplateUpdate = require('./server/zone-template/zone-template.model').createZoneTemplateFromXLSX;
let zoneSetTemplateUpdate = require('./server/zone-template/zone-template.model').createZoneSetTemplateFromXLSX;
let markerTemplateUpdate = require('./server/marker-template/marker-template.function').importMarkerTemplate;
let markerSetTemplateUpdate = require('./server/marker-template/marker-template.function').importMarkerSetTemplate;
let flowTemplateUpdate = require('./server/flow/sync-master-flow');

const fs = require('fs');
let path = require('path');
const QUEUE_TIME = 500;

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
}

global.wiEventEmitter = new MyEmitter();

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
	fs.appendFileSync('./pids.pid', process.pid + '\n');
	main();
	// let familySystemSync = require('./server/family/FamilySystemSync');
	// familySystemSync(function () {
	//     overlayLineUpdate(function () {
	//
	//     });
	//     workflowSpecUpdate(function () {
	//
	//     });
	//     taskSpecUpdate(function () {
	//
	//     });
	//     zoneTemplateUpdate(function () {
	//
	//     });
	//     markerTemplateUpdate(function () {
	//
	//     })
	// });
}, 100);

function main() {
	let authenticate;
	let accessLogStream;
	let express = require('express');
	let app = express();
	let morgan = require('morgan');
	let os = require('os');
	const cors = require('cors');
	let fullConfig = require('config');
	let config = fullConfig.Application;
	// let influx = require('./server/utils/influx/index');
	require('./server/utils/redis');
	let projectRouter = require('./server/project/project.router');
	let wellRouter = require('./server/well/well.router');
	let plotRouter = require('./server/plot/plot.router');
	let markerRouter = require('./server/marker/marker.router');
	let curveRouter = require('./server/curve/curve.router');
	let trackRouter = require('./server/track/track.router');
	let depthAxisRouter = require('./server/depth-axis/depth-axis.router');
	// let uploadRouter = require('./server/upload/index');
	let datasetRouter = require('./server/dataset/dataset.router');
	let lineRouter = require('./server/line/line.router');
	let shadingRouter = require('./server/shading/shading.router');
	let zoneTrackRouter = require('./server/zone-track/zone-track.router');
	let zoneSetRouter = require('./server/zone-set/zone-set.router');
	let zoneRouter = require('./server/zone/zone.router');
	let imageUpload = require('./server/image-upload');
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
	let zoneSetTemplateRouter = require('./server/zone-set-template/zone-set-template.router');
	let zoneTemplateRouter = require('./server/zone-template/zone-template.router');
	let patternRouter = require('./server/pattern/pattern.router');
	let flowRouter = require('./server/flow/flow.router');
	let taskRouter = require('./server/task/task.router');
	let taskSpecRouter = require('./server/task/task-spec.router');
	let exportRouter = require('./server/export/export.router');
	let parameterSetRouter = require('./server/parameter-set/parameter-set.router');
	let markerSetRouter = require('./server/marker-set/marker-set.router');
	let markerTemplateRouter = require('./server/marker-template/marker-template.router');
	let markerSetTemplateRouter = require('./server/marker-set-template/marker-set-template.router');
	let resetDefaulParameters = require('./server/reset-parameter/reset-pamameter.router');
	let permissionRouter = require('./server/permission/permission.router');
	let storageDatabseRouter = require('./server/storage-database/storage-database.router');
	let imageRouter = require('./server/image/image.router');
	let imageSetRouter = require('./server/image-set/image-set.router');
	let logViewRouter = require('./server/log-view/log-view.router');
	let analysisRouter = require('./server/analysis/analysis.router');
	// let projectLogRouter = require('./server/project-log/project-log.router');
	let queue = {};
	let http = require('http').Server(app);
	let bodyParser = require('body-parser');
	app.use(bodyParser.json({limit: '50mb', extended: true, type: 'application/json'}));
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true, type: 'application/json'}));
	app.use(cors());
	// app.use(queue({activeLimit: 2, queuedLimit: 2}));
	/**
	 Attach all routers to app
	 */
	app.get('/info', (req, res) => {
		res.send(require('./server/utils/information').serverInfo);
	});
	app.use(express.static(fullConfig.imageBasePath));
	app.use('/pattern', express.static(path.join(__dirname, '/server/pattern/files')));
	const compression = require('compression');
	app.use(compression({filter: shouldCompress}));

	function shouldCompress(req, res) {
		if (req.headers['x-no-compression']) {
			// don't compress responses with this request header
			return false
		}
		// fallback to standard filter function
		return compression.filter(req, res)
	}

	let request = require('request');
	// app.post('/phrase/new', (req, res) => {
	// 	let responseJSON = require('./server/response');
	// 	let filePath = path.join(__dirname, 'phrase.json');
	// 	if (!fs.existsSync(filePath)) {
	// 		fs.writeFileSync(filePath, "{}");
	// 	}
	// 	let newPhrase = JSON.parse(fs.readFileSync(filePath).toString());
	// 	Object.assign(newPhrase, req.body);
	// 	fs.writeFileSync(filePath, JSON.stringify(newPhrase));
	// 	res.json(responseJSON(200, "Done", newPhrase));
	// });
	// app.post('/phrase/get', (req, res) => {
	// 	let responseJSON = require('./server/response');
	// 	let filePath = path.join(__dirname, 'phrase.json');
	// 	if (!fs.existsSync(filePath)) {
	// 		fs.writeFileSync(filePath, "{}");
	// 	}
	// 	let newPhrase = JSON.parse(fs.readFileSync(filePath).toString());
	// 	res.json(responseJSON(200, "Done", newPhrase));
	// });
	// app.get('/phrase/clear', (req, res) => {
	// 	let filePath = path.join(__dirname, 'phrase.json');
	// 	if (!fs.existsSync(filePath)) {
	// 		fs.writeFileSync(filePath, "{}");
	// 	}
	// 	fs.writeFileSync(filePath, "{}");
	// 	res.send("Done");
	// });
	app.get('/update', function (req, res) {
		let familySystemSync = require('./server/family/FamilySystemSync');
		familySystemSync(function () {
			overlayLineUpdate(function () {

			});
			workflowSpecUpdate(function () {

			});
			taskSpecUpdate(function () {

			});
			zoneSetTemplateUpdate(function () {
				zoneTemplateUpdate(function () {

				});
			});
			markerSetTemplateUpdate(function () {
				markerTemplateUpdate(function () {

				});
			});
			flowTemplateUpdate.syncMasterFlow(function () {
				flowTemplateUpdate.syncMasterTask(function () {

				});
			});
			res.send("Done");
		});
	});
	app.use('/', globalFamilyRouter);
	app.get('/', function (req, res) {
		res.send("WELCOME TO WI-SYSTEM");
	});
	app.use('/', databaseRouter);
	authenticate = require('./server/authenticate/authenticate');
	app.use(authenticate());
	let scriptRouter = require('./server/script/script');
	app.use('/script', scriptRouter);
	app.use('/', testRouter);
	app.use('/csv', (req, res) => {
		let url = fullConfig.csvService.host + req.originalUrl;
		console.log(url);
		req.pipe(
			request({
				url,
				method: req.method,
				strictSSL: false
			})
		).pipe(res);
	});

	app.use(function (req, res, next) {
		const start = Date.now();
		// The 'finish' event will emit once the response is done sending
		res.once('finish', () => {
			// Emit an object that contains the original request and the elapsed time in MS
			let duration = Date.now() - start;
			// profiles.emit('route', {req, elapsedMS: duration});
			console.log(req.decoded.username, (req.header('x-real-ip') || req.ip), req.method, req.originalUrl, `${duration}ms`);
			// influx.writePoints([
			// 	{
			// 		measurement: 'response_times',
			// 		tags: {username: req.decoded.username, path: req.originalUrl,},
			// 		fields: {duration, ipaddr: (req.header('x-real-ip') || req.ip), pid: process.pid},
			// 	}
			// ]).catch(err => {
			// 	next();
			// 	console.error(`Error saving data to InfluxDB! ${err.stack}`)
			// })
		});
		next();
	});
	app.use('/', patternRouter);
	app.use('/', inventoryRouter);
	// app.use('/', uploadRouter);
	app.use('/', projectRouter);
	app.use('/', familyRouter);
	app.use('/', familyUnitRouter);
	app.use('/', imageUpload);
	app.use('/', dustbinRouter);
	app.use('/', workflowRouter);
	app.use('/', workflowSpecRouter);
	app.use('/', zoneTemplateRouter);
	app.use('/', zoneSetTemplateRouter);
	app.use('/', markerSetTemplateRouter);
	app.use('/', markerTemplateRouter);
	app.use('/', taskSpecRouter);
	app.use('/project/well', imageSetRouter);
	app.use('/project/well/image-set', imageRouter);
	app.use('/project', parameterSetRouter);
	app.use('/project', storageDatabseRouter);
	app.use('/permission', permissionRouter);
	app.use('/reset-parameter', resetDefaulParameters);
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
	app.use('/project', combinedBoxRouter);
	app.use('/project/well', markerSetRouter);
	app.use('/project', flowRouter);
	app.use('/project/flow', taskRouter);
	app.use('/project', analysisRouter);
	// app.use('/project', projectLogRouter);
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
	app.use('/project/combined-box', selectionToolRouter);
	app.use('/project/combined-box', combinedBoxToolRouter);
	app.use('/project/plot', imageTrackRouter);
	app.use('/project/plot', depthAxisRouter);
	app.use('/project/plot', trackRouter);
	app.use('/project/plot', zoneTrackRouter);
	app.use('/project/plot', objectTrackRouter);
	app.use('/project/well/marker-set', markerRouter);
	app.use('/project/plot/track', shadingRouter);
	app.use('/project/plot/track', lineRouter);
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
	app.use('/export', exportRouter);
	app.use('/log-view', logViewRouter);


	accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
	app.use(morgan('combined', {stream: accessLogStream}));

	http.listen(config.port, function () {
		console.log("Listening on port " + config.port);
	});
}
