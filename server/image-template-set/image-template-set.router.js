const express = require('express');
const router = express.Router();
const model = require('./image-template-set.model');

router.post('/image-template-set/new', (req, res) => {
	model.createImageTemplateSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template-set/info', (req, res) => {
	model.infoImageTemplateSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template-set/delete', (req, res) => {
	model.deleteImageTemplateSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template-set/edit', (req, res) => {
	model.updateImageTemplateSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template-set/list', (req, res) => {
	model.listImageTemplateSet(req.body, status => {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;