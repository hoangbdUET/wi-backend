var express = require('express');
var router = express.Router();
var plotModel = require('./plot.model');
var bodyParser = require('body-parser');
var fs = require('fs');
const multer = require('multer');

router.use(bodyParser.json());

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	}
});

var upload = multer({storage: storage});

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
	}, req.dbConnection);
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
module.exports = router;