const express = require('express');
const router = express.Router();
const model = require('./ml-project.model');

router.post('/ml-project/list', (req, res) => {
	model.listMlProject(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/ml-project/new', (req, res) => {
	model.createMlProject(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/ml-project/info', (req, res) => {
	model.infoMlProject(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/ml-project/edit', (req, res) => {
	model.editMlProject(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/ml-project/delete', (req, res) => {
	model.deleteMlProject(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;