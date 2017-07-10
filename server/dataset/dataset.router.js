var express = require('express');
var datasetModel = require('./dataset.model');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/dataset/info', function (req,res) {
    datasetModel.getDatasetInfo(req.body, function (status) {
        res.send(status);
    });
});
router.post('/dataset/new', function (req,res) {
    datasetModel.createNewDataset(req.body, function (status) {
        res.send(status);
    });
});
router.post('/dataset/edit', function (req,res) {
    datasetModel.editDataset(req.body,function (status) {
        res.send(status);
    })
});
router.delete('/dataset/delete', function (req,res) {
    datasetModel.deleteDataset(req.body,function (status) {
        res.send(status);
    })
});

module.exports = router;