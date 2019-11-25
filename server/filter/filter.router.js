let filterModel = require('./filter.model');
const express = require('express');
let router = express.Router();
router.use(bodyParser.json());

router.post('/filter/new', function (req, res) {
	filterModel.create(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/filter/delete', function (req, res) {
	filterModel.deleteFilter(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/filter/edit', function (req, res) {
	filterModel.edit(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/filter/info', function (req, res) {
	filterModel.info(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/filter/list', function (req, res) {
	filterModel.list(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

module.exports = router;