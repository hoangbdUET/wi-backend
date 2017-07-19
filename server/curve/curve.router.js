'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;

let curveModel = require('./curve.model');

router.use(bodyParser.json());

router.post('/curve/info', function (req, res) {
    curveModel.getCurveInfo(req.body,function (status) {
        res.send(status);
    })
});
router.post('/curve/new', function (req, res) {
    curveModel.createNewCurve(req.body,function (status) {
        res.send(status);
    })

});
router.post('/curve/edit', function (req, res) {
    curveModel.editCurve(req.body,function (status) {
        res.send(status);
    })

});
router.delete('/curve/delete', function (req, res) {
    curveModel.deleteCurve(req.body,function (status) {
        res.send(status);
    })
});

router.post('/curve/getData', function(req, res) {
    curveModel.getData(req.body, function(resultStream) {
        if(resultStream) resultStream.pipe(res);
        else res.send(ResponseJSON(ErrorCodes.ERROR_CURVE_DATA_FILE_NOT_EXISTS, "Curve data file does not exist"));
    }, function(status) {
        res.send(status);
    });
});

module.exports = router;
