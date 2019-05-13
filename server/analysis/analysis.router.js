const express = require('express');
const router = express.Router();
const model = require('./analysis.model');

router.post('/analysis/list', (req, res) => {
	model.listAnalysis(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/analysis/new', (req, res) => {
	model.createAnalysis(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/analysis/info', (req, res) => {
	model.infoAnalysis(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/analysis/edit', (req, res) => {
	model.editAnalysis(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.delete('/analysis/delete', (req, res) => {
	model.deleteAnalysis(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;