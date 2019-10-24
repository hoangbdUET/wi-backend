let express = require('express');
let router = express.Router();
let plotModel = require('./plot.model');
let bodyParser = require('body-parser');
let fs = require('fs');
let uploadDir = process.env.BACKEND_USER_UPLOAD_PATH || require('config').uploadPath;
const multer = require('multer');

router.use(bodyParser.json());

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

let upload = multer({storage: storage});

router.post('/plot/info', function (req, res) {
	plotModel.getPlotInfo(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.post('/plot/new', function (req, res) {
	plotModel.createNewPlot(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username)
});
router.post('/plot/edit', function (req, res) {
	plotModel.editPlot(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.delete('/plot/delete', function (req, res) {
	plotModel.deletePlot(req.body, function (status) {
		res.send(status);
	}, req.dbConnection)
});
router.post('/plot/duplicate', function (req, res) {
	req.setTimeout(180000);
	plotModel.duplicatePlot(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, false);
});

router.post('/plot/export', function (req, res) {
	let exporter = require('./plot.exporter');
	exporter(req.body, function (code, fileResult) {
		res.status(code).sendFile(fileResult, function (err) {
			if (err) console.log('Export plot: ' + err);
			fs.unlinkSync(fileResult);
		});
	}, function (code) {
		res.status(code).end();
	}, req.dbConnection, req.decoded.username)
});

router.post('/plot/import', upload.single('file'), function (req, res) {
	let importer = require('./plot.importer');
	importer(req, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/plot/save-as', function (req, res) {
	plotModel.duplicatePlot(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.body.name);
});

router.post('/plot/new-from-parameter', function (req, res) {
	let importer = require('./plot.importer');
	importer(req, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username);
});

router.post('/plot/list', (req, res) => {
	plotModel.listPlot(req.body, status => {
		res.send(status);
	}, req.dbConnection)
});

module.exports = router;