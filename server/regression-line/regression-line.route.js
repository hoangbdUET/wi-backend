var express = require('express');
var router = express.Router();
var regressionLineModel = require('./regression-line.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/regression-line/info', function (req, res) {
    regressionLineModel.getRegressionLineInfo(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/regression-line/new', function (req, res) {
    regressionLineModel.createNewRegressionLine(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/regression-line/edit', function (req, res) {
    regressionLineModel.editRegressionLine(req.body,function (status) {
        res.send(status);
    },req.dbConnection)
});
router.delete('/regression-line/delete', function (req, res) {
    regressionLineModel.deleteRegressionLine(req.body, function (status) {
        res.send(status);
    },req.dbConnection)
});

module.exports = router;

