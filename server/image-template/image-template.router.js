const express = require('express');
const router = express.Router();
const model = require('./image-template.model');

router.post('/image-template/new', (req, res) => {
	model.createImageTemplate(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template/info', (req, res) => {
	model.infoImageTemplate(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template/delete', (req, res) => {
	model.deleteImageTemplate(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/image-template/edit', (req, res) => {
	model.updateImageTemplate(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;