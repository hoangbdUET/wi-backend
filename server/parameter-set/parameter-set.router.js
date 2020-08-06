const express = require('express');
const multer = require('multer');
let router = express.Router();
let model = require('./parameter-set.model');
const upload = multer();

router.post('/parameter-set/new', upload.single('content'), async function (req, res) {
	req.body.createdBy = req.createdBy;
	req.body.updatedBy = req.updatedBy;
	req.body.content = req.file ? JSON.parse(req.file.buffer.toString()) : req.body.content;
	model.createNewParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.post('/parameter-set/info', function (req, res) {
	model.infoParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.post('/parameter-set/list', function (req, res) {
	model.listParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.post('/parameter-set/edit', upload.single('content'), function (req, res) {
	req.body.createdBy = req.createdBy;
	req.body.updatedBy = req.updatedBy;
	req.body.content = req.file ? JSON.parse(req.file.buffer.toString()): req.body.content;
	model.updateParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.delete('/parameter-set/delete', function (req, res) {
	model.deleteParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/parameter-set/download', function (req, res) {
	const fs = require('fs');
	model.downloadParameterSet(req.body, function (err, tempPath) {
		if (err) {
			res.send(err)
		} else {
			res.sendFile(tempPath, err => {
				fs.unlink(tempPath)
			});
		}
	}, req.dbConnection);
});

module.exports = router;