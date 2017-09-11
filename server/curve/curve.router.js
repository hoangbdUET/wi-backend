'use strict';
const fs = require('fs');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
let curveModel = require('./curve.model');


router.use(bodyParser.json());

///start curve advance actions
router.post('/curve/copy', (req, res) => {
    console.log(req.body);
    curveModel.copyCurve(req.body, (status) => {
        res.send(status);
    },req.dbConnection)
    //res.send("Copy curve");
});

router.post('/curve/move', (req, res) => {
    console.log(req.body);
    curveModel.moveCurve(req.body, (status) => {
        res.send(status);
    },req.dbConnection)
});

router.delete('/curve/delete', function (req, res) {
    console.log(req.body);
    curveModel.deleteCurve(req.body, (status) => {
        res.send(status);
    },req.dbConnection)
});
///end curve advance actions
router.post('/curve/info', function (req, res) {
    //console.log("Get info");
    curveModel.getCurveInfo(req.body, function (status) {
        res.send(status);
    },req.dbConnection)
});
router.post('/curve/new', function (req, res) {
    //console.log("Create curve");
    curveModel.createNewCurve(req.body, function (status) {
        res.send(status);
    },req.dbConnection)

});
router.post('/curve/edit', function (req, res) {
    //console.log("Edit curve");
    curveModel.editCurve(req.body, function (status) {
        res.send(status);
    },req.dbConnection)

});
router.post('/curve/export', function (req, res) {
    curveModel.exportData(req.body, function (code, fileResult) {
        res.status(code).sendFile(fileResult, function (err) {
            if (err) console.log('Export curve: ' + err);
            fs.unlinkSync(fileResult);
        });
    }, function (code) {
        res.status(code).end();
    },req.dbConnection)
});


router.post('/curve/getData', function (req, res) {
    //console.log("Get data");
    // Encode data curve
    /*
    curveModel.getData(req.body, function(err, resultStream) {
        if(err) res.send(err);
        else {
            if(resultStream) {
                res.end(JSON.stringify(ResponseJSON(ErrorCodes.SUCCESS,"Success", resultStream)));
            }
            else res.end(ResponseJSON(ErrorCodes.ERROR_CURVE_DATA_FILE_NOT_EXISTS, "Curve data file does not exist"));
        }
    }, function(status) {
        res.send(status);
    });
    */
    curveModel.getData(req.body, function (resultStream) {
        if (resultStream) resultStream.pipe(res);
    }, function (status) {
        res.send(status);
    },req.dbConnection);
});

module.exports = router;
