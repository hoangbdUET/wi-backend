var express = require('express');
var router = express.Router();
var referenceCurveModel = require('./reference-curve.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/reference-curve/new', function (req, res) {
    referenceCurveModel.createNewReferenceCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/reference-curve/info', function (req, res) {
    referenceCurveModel.infoReferenceCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/reference-curve/edit', function (req, res) {
    referenceCurveModel.editReferenceCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.post('/reference-curve/list', function (req, res) {
    referenceCurveModel.listReferenceCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

router.delete('/reference-curve/delete', function (req, res) {
    referenceCurveModel.deleteReferenceCurve(req.body, function (status) {
        res.send(status);
    }, req.dbConnection);
});

module.exports = router;
