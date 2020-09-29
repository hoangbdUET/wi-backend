const express = require('express');
const multer = require('multer');
let router = express.Router();
let model = require('./parameter-set.model');
const upload = multer();

router.post('/parameter-set/new', upload.single('content'), async function (req, res) {
	req.body.createdBy = req.createdBy;
	req.body.updatedBy = req.updatedBy;
	if (req.file) {
		req.body.content = JSON.parse(req.file.buffer.toString());
	}
	model.createNewParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.CurrentProject);
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
	if (req.file) {
		req.body.content = JSON.parse(req.file.buffer.toString());
	}
	model.updateParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.CurrentProject);
});
router.delete('/parameter-set/delete', function (req, res) {
	model.deleteParameterSet(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.CurrentProject);
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