let express = require('express');
let router = express.Router();
let plotModel = require('./plot.model');
let fs = require('fs');
let uploadDir = process.env.BACKEND_USER_UPLOAD_PATH || require('config').uploadPath;
const multer = require('multer');
const parameterSetModel = require('../parameter-set/parameter-set.model');



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
	exporter(req.body, function (plot) {
		if (req.body.idParameterSet) {
			parameterSetModel.updateParameterSet({ ...req.body, content: plot }, (status) => res.send(status), req.dbConnection);
		} else {
			parameterSetModel.createNewParameterSet({ ...req.body, content: plot }, (status) => res.send(status), req.dbConnection);
		}
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