const express = require('express');
const router = express.Router();
const model = require('./image-set.model');

router.post('/image-set/new', (req, res) => {
	model.createImageSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.logger);
});

router.post('/image-set/info', (req, res) => {
	model.infoImageSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-set/delete', (req, res) => {
	model.deleteImageSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.logger);
});

router.post('/image-set/edit', (req, res) => {
	model.updateImageSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.logger);
});

router.post('/image-set/duplicate', (req, res) => {
	model.duplicateImageSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection, req.logger);
});

router.post('/image-set/list', (req, res) => {
	model.listImageSet(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;