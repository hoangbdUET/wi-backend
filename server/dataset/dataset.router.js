let express = require('express');
let datasetModel = require('./dataset.model');
let router = express.Router();
let bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/dataset/info', function (req, res) {
	datasetModel.getDatasetInfo(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});
router.post('/dataset/info-by-name', function (req, res) {
	datasetModel.getDatasetInfoByName(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
})
router.post('/dataset/new', function (req, res) {
	datasetModel.createNewDataset(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.logger);
});
router.post('/dataset/edit', function (req, res) {
	datasetModel.editDataset(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username, req.logger);
});

router.delete('/dataset/delete', function (req, res) {
	datasetModel.deleteDataset(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.logger)
});

router.post('/dataset/duplicate', function (req, res) {
	datasetModel.duplicateDataset(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username, req.logger);
});

router.post('/dataset/bulk-update-params', function (req, res) {
	datasetModel.updateDatasetParams(req.body, function (status) {
		res.send(status);
	}, req.dbConnection);
});

router.post('/dataset/delete-dataset-param', (req, res) => {
	datasetModel.deleteDatasetParam(req.body, (status) => {
		res.send(status);
	}, req.dbConnection);
});

router.post('/dataset/create-md', function (req, res) {
	datasetModel.createMdCurve(req.body, function (status) {
		res.send(status);
	}, req.dbConnection, req.decoded.username, req.logger);
});

router.post('/dataset/copy', async (req, res) => {
	let status = await datasetModel.copyDataset(req.body, req.dbConnection, req.decoded.username, req.logger);
	res.send(status);
});

module.exports = router;