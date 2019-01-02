const express = require('express');
let router = express.Router();
let flowModel = require('./flow.model');


router.post('/flow/new', function (req, res) {
	flowModel.createNewFlow(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/flow/info', function (req, res) {
	flowModel.infoFlow(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/flow/list', function (req, res) {
	flowModel.listFlow(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/flow/edit', function (req, res) {
	flowModel.editFlow(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.delete('/flow/delete', function (req, res) {
	flowModel.deleteFlow(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/flow/duplicate', (req, res) => {
	flowModel.duplicateFlow(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/flow/save-as-template', (req, res) => {
	flowModel.saveAsTemplate(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;